from django.urls import path

from django.conf import settings
from django.conf.urls.static import static

from django.urls import re_path

from . import views

urlpatterns = [
    path('login', views.loginUser, name='login'),
    path('register', views.registerUser, name='register'),


    path('form_search/<str:tbl_name>/', views.formSearch, name='form_search'),
    path('form_search/<str:tbl_name>/<str:field_code>', views.formSearch, name='form_search'),
    path('form_search/<str:tbl_name>/<str:tbl_field>/<str:field_code>', views.formSearch, name='form_search'),
    path('form_search/<str:tbl_name>/<str:tbl_field>/<str:tbl_field_2>/<str:field_code>', views.formSearch, name='form_search'),

    path('invoice_search/<str:sales_or_purchase>/<str:transaction_type>', views.invoiceSearch, name='invoice_search'),
    path('invoice_search/<str:sales_or_purchase>/<str:transaction_type>/<str:field_code>', views.invoiceSearch, name='invoice_search'),
    path('invoice_search/<str:sales_or_purchase>/<str:transaction_type>/<str:tbl_field>/<str:field_code>', views.invoiceSearch, name='invoice_search'),
    path('invoice_search/<str:sales_or_purchase>/<str:transaction_type>/<str:tbl_field>/<str:tbl_field_2>/<str:field_code>', views.invoiceSearch, name='invoice_search'),

    path('home_details', views.homeDetails, name='home_details'),
    path('accounts_receivables', views.accountsReceivables, name='accounts_receivables'),
    path('accounts_payables', views.accountsPayables, name='accounts_payables'),
    path('cheques', views.cheques, name='cheques'),

    path('get_csrf_token', views.get_csrf_token, name='get_csrf_token'),
    path('clear_all', views.clear_all, name='clear_all'),

    path('pdf/<str:module>/<int:id>', views.pdf_print, name='pdf'),

    re_path(r'^company_information$', views.company_information),
    re_path(r'^company_information/([0-9]+)$', views.company_information),

    re_path(r'^category$', views.category),
    re_path(r'^category/([0-9]+)$', views.category),

    re_path(r'^employee$', views.employee),
    re_path(r'^employee/([0-9]+)$', views.employee),

    re_path(r'^customer$', views.customer),
    re_path(r'^customer/([0-9]+)$', views.customer),

    re_path(r'^vendor$', views.vendor),
    re_path(r'^vendor/([0-9]+)$', views.vendor),

    re_path(r'^product$', views.product),
    re_path(r'^product/([0-9]+)$', views.product),

    re_path(r'^product_unit/([0-9]+)$', views.productUnit),

    re_path(r'^account$', views.account),
    re_path(r'^account/([0-9]+)$', views.account),

    re_path(r'^sales$', views.sales),
    re_path(r'^sales/([0-9]+)$', views.sales),

    re_path(r'^sales_return$', views.sales),
    re_path(r'^sales_return/([0-9]+)$', views.sales),

    re_path(r'^purchase$', views.purchase),
    re_path(r'^purchase/([0-9]+)$', views.purchase),

    re_path(r'^purchase_return$', views.purchase),
    re_path(r'^purchase_return/([0-9]+)$', views.purchase),

    re_path(r'^purchase_order$', views.purchase_order),
    re_path(r'^purchase_order/([0-9]+)$', views.purchase_order),

    re_path(r'^sales_order$', views.sales_order),
    re_path(r'^sales_order/([0-9]+)$', views.sales_order),

    re_path(r'^rfq$', views.rfq),
    re_path(r'^rfq/([0-9]+)$', views.rfq),

    re_path(r'^delivery_note$', views.delivery_note),
    re_path(r'^delivery_note/([0-9]+)$', views.delivery_note),

    re_path(r'^quotation$', views.quotation),
    re_path(r'^quotation/([0-9]+)$', views.quotation),

    re_path(r'^preforma$', views.preforma),
    re_path(r'^preforma/([0-9]+)$', views.preforma),

    re_path(r'^payment$', views.payment),
    re_path(r'^payment/([0-9]+)$', views.payment),

    re_path(r'^receipt$', views.receipt),
    re_path(r'^receipt/([0-9]+)$', views.receipt),

    re_path(r'^journal_voucher$', views.journal_voucher),
    re_path(r'^journal_voucher/([0-9]+)$', views.journal_voucher),

    re_path(r'^petty_cash$', views.petty_cash),
    re_path(r'^petty_cash/([0-9]+)$', views.petty_cash),

    re_path(r'^cheque_transfer$', views.cheque_transfer),
    re_path(r'^cheque_transfer/([0-9]+)$', views.cheque_transfer),




    re_path(r'^(?P<report_type>\w+)_report/$', views.report),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)