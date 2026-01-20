from django.urls import path
from .views import CreateDonationView, ExecuteDonationView, DonationListView, DeclareDonationView, UpdateDonationStatusView, DeleteDonationView, GlobalDonationStatsView

urlpatterns = [
    path('', DonationListView.as_view(), name='donation_list'),
    path('global-stats/', GlobalDonationStatsView.as_view(), name='donation_global_stats'),
    path('create/', CreateDonationView.as_view(), name='donation_create'),
    path('declare/', DeclareDonationView.as_view(), name='donation_declare'),
    path('<int:donation_id>/update-status/', UpdateDonationStatusView.as_view(), name='donation_update_status'),
    path('<int:donation_id>/delete/', DeleteDonationView.as_view(), name='donation_delete'),
    path('execute/', ExecuteDonationView.as_view(), name='donation_execute'),
]
