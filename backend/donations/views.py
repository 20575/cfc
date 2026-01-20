from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.conf import settings
from django.db import models
from .models import Donation
from .serializers import DonationSerializer
from .services import PayPalService

class CreateDonationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'EUR')
        is_anonymous = request.data.get('is_anonymous', False)
        
        # In a real scenario, these URLs would point to your Frontend
        return_url = request.data.get('return_url', "http://localhost:5173/donation/success")
        cancel_url = request.data.get('cancel_url', "http://localhost:5173/donation/cancel")

        if not amount:
            return Response({"error": "Le montant est requis"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = PayPalService.create_payment(amount, currency, return_url, cancel_url)
        except Exception as e:
            print(f"EXCEPTION IN CREATE DONATION: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if payment:
            # Save the donation in PENDING status
            donation = Donation.objects.create(
                user=request.user if request.user.is_authenticated else None,
                amount=amount,
                currency=currency,
                paypal_payment_id=payment.id,
                is_anonymous=is_anonymous,
                status=Donation.Status.PENDING
            )
            
            # Find the approval URL to send back to the client
            approval_url = next(link.href for link in payment.links if link.rel == 'approval_url')
            
            return Response({
                "donation_id": donation.id,
                "paypal_payment_id": payment.id,
                "approval_url": approval_url
            }, status=status.HTTP_201_CREATED)
        
        return Response({"error": "Impossible de créer le paiement PayPal"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExecuteDonationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payment_id = request.data.get('payment_id')
        payer_id = request.data.get('payer_id')

        if not payment_id or not payer_id:
            return Response({"error": "payment_id et payer_id sont requis"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            donation = Donation.objects.get(paypal_payment_id=payment_id)
        except Donation.DoesNotExist:
            return Response({"error": "Donation introuvable"}, status=status.HTTP_404_NOT_FOUND)

        payment = PayPalService.execute_payment(payment_id, payer_id)

        if payment:
            donation.status = Donation.Status.COMPLETED
            donation.paypal_payer_id = payer_id
            donation.save()
            return Response({"status": "Donation complétée avec succès"}, status=status.HTTP_200_OK)
        else:
            donation.status = Donation.Status.FAILED
            donation.save()
            return Response({"error": "Échec de l'exécution du paiement"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DonationListView(views.APIView):
    """
    Liste des donations personnelles.
    Membres et Pasteurs: Voient uniquement leurs donations non-archivées
    Admin: Voit toutes les donations non-archivées
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # ADMIN: Voit toutes les donations non-archivées
        if user.role == 'ADMIN' or user.is_superuser:
            donations = Donation.objects.filter(is_archived=False).order_by('-created_at')
        
        # MEMBRES ET PASTEURS: Voient uniquement leurs donations personnelles non-archivées
        else:
            donations = Donation.objects.filter(user=user, is_archived=False).order_by('-created_at')
        
        serializer = DonationSerializer(donations, many=True)
        return Response(serializer.data)

class GlobalDonationStatsView(views.APIView):
    """
    Statistiques globales des donations (montant total).
    Accessible uniquement aux Pasteurs et Admins.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Seuls les Pasteurs et Admins peuvent voir les stats globales
        if user.role not in ['PASTOR', 'ADMIN'] and not user.is_superuser:
            return Response({
                "error": "Accès non autorisé"
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Calculer le total de TOUS les dons validés (même archivés)
        total_amount = Donation.objects.filter(
            status=Donation.Status.COMPLETED
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        
        total_count = Donation.objects.filter(
            status=Donation.Status.COMPLETED
        ).count()
        
        return Response({
            'role': user.role,
            'total_amount': float(total_amount),
            'total_count': total_count,
            'currency': 'EUR',
            'message': 'Statistiques globales'
        })

class DeclareDonationView(views.APIView):
    """
    Permet aux utilisateurs authentifiés de déclarer un don manuel
    (WhatsApp, Virement bancaire, Espèces, etc.)
    Le don est créé avec le statut PENDING et doit être validé par un admin
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'EUR')
        project = request.data.get('project', 'general')
        payment_method = request.data.get('payment_method', 'other')
        notes = request.data.get('notes', '')
        
        if not amount:
            return Response({
                "error": "Le montant est requis"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount_decimal = float(amount)
            if amount_decimal <= 0:
                return Response({
                    "error": "Le montant doit être supérieur à 0"
                }, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({
                "error": "Montant invalide"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Créer le don avec un ID de paiement unique (pour respecter la contrainte unique)
        import uuid
        unique_payment_id = f"MANUAL-{request.user.id}-{uuid.uuid4().hex[:12]}"
        
        donation = Donation.objects.create(
            user=request.user,
            amount=amount_decimal,
            currency=currency,
            project=project,
            paypal_payment_id=unique_payment_id,  # ID unique pour les dons manuels
            status=Donation.Status.PENDING,
            is_anonymous=False
        )
        
        serializer = DonationSerializer(donation)
        return Response({
            "message": "Don déclaré avec succès. En attente de validation par l'administrateur.",
            "donation": serializer.data
        }, status=status.HTTP_201_CREATED)

class UpdateDonationStatusView(views.APIView):
    """
    Permet aux administrateurs de mettre à jour le statut d'un don
    (Valider PENDING -> COMPLETED, ou Annuler PENDING -> CANCELLED)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, donation_id):
        # Vérifier que l'utilisateur est admin
        if request.user.role != 'ADMIN' and not request.user.is_superuser:
            return Response({
                "error": "Seuls les administrateurs peuvent modifier le statut des dons"
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({
                "error": "Don introuvable"
            }, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        
        if new_status not in ['COMPLETED', 'CANCELLED', 'PENDING', 'FAILED']:
            return Response({
                "error": "Statut invalide. Valeurs possibles : COMPLETED, CANCELLED, PENDING, FAILED"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        donation.status = new_status
        donation.save()
        
        serializer = DonationSerializer(donation)
        return Response({
            "message": f"Statut du don mis à jour : {new_status}",
            "donation": serializer.data
        }, status=status.HTTP_200_OK)

class DeleteDonationView(views.APIView):
    """
    Permet aux administrateurs d'archiver un don (suppression logique)
    Le don reste en base pour le calcul du montant total
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, donation_id):
        # Vérifier que l'utilisateur est admin
        if request.user.role != 'ADMIN' and not request.user.is_superuser:
            return Response({
                "error": "Seuls les administrateurs peuvent archiver des dons"
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({
                "error": "Don introuvable"
            }, status=status.HTTP_404_NOT_FOUND)
        
        donation_info = f"Don de {donation.amount} {donation.currency}"
        # Archiver au lieu de supprimer physiquement
        donation.is_archived = True
        donation.save()
        
        return Response({
            "message": f"{donation_info} archivé avec succès (le montant reste comptabilisé)"
        }, status=status.HTTP_200_OK)

