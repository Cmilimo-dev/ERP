from django.apps import apps
from django.forms import model_to_dict
from django.shortcuts import get_object_or_404, render, redirect

from django.contrib import messages
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.hashers import make_password

from django.db import transaction
from django.db.models import Q, Max, Sum, F
import json

from datetime import datetime, timedelta
from django.utils.timezone import now

from django.template.loader import get_template
import pdfkit
from django.conf import settings
from .convertions import to_decimal, to_integer
from num2words import num2words

from . models import tblAccountsPayables, tblAccountsReceivables, tblChartOfAccounts, tblChequeTransfer, tblCheques, tblCompanyInformation, tblPettyCash_Details, tblPettyCash_Master, tblUsers, tblSales_Details, tblSales_Master, tblCustomer, tblPurchase_Master, tblPurchase_Details, tblVendor, tblProduct, tblProduct_unit, tblCategory, tblEmployee, tblSalesOrder_Master, tblSalesOrder_Details, tblPurchaseOrder_Master, tblPurchaseOrder_Details, tblRFQ_Master, tblRFQ_Details, tblQuotation_Master, tblQuotation_Details, tblPreforma_Master, tblPreforma_Details,tblDeliveryNote_Master, tblDeliveryNote_Details, tblPayment, tblReceipt, tblJournalVoucher_Master, tblJournalVoucher_Details

from django.http import JsonResponse, HttpResponse
from django.middleware.csrf import get_token

from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser

from .serializers import AccountsPayablesSerializer, AccountsReceivablesSerializer, ChequeSerializer, ChequeTransferSerializer, CompanySerializer, CustomerSerializer, DeliveryNoteDetailsSerializer, DeliveryNoteSerializer, JournalVoucherDetailsSerializer, JournalVoucherSerializer, PaymentSerializer, PettyCashDetailsSerializer, PettyCashSerializer, PreformaDetailsSerializer, PreformaSerializer, PurchaseDetailsSerializer, PurchaseOrderDetailsSerializer, PurchaseOrderSerializer, PurchaseSerializer, QuotationDetailsSerializer, QuotationSerializer, ReceiptSerializer, SalesOrderDetailsSerializer, SalesOrderSerializer, VendorSerializer, AccountSerializer, CategorySerializer, EmployeeSerializer, ProductSerializer, ProductUnitSerializer, RFQSerializer, RFQDetailsSerializer, SalesSerializer, SalesDetailsSerializer

import logging

logger = logging.getLogger(__name__)

class idExists:
    """
    Checks if next or previous id exists using current id
    """
    def __init__(self, tbl, frm_id, module_name):
        self.tbl = tbl
        self.frm_id = frm_id
        self.module_name = module_name
    def getFirstID(self):
        first = self.tbl.objects.first()
        if first is None:
            return None
        return model_to_dict(first)['id']
    
    def getLastID(self):
        last = self.tbl.objects.last()
        if last is None:
            return None
        return model_to_dict(last)['id']

    
    def getNextID(self):
        filter_condition = {'id__gt': self.frm_id}
        if self.module_name == 'sales' or self.module_name == 'purchase':
            filter_condition['transaction_type'] = self.module_name
        elif self.module_name == 'sales_return' or self.module_name == 'purchase_return':
            filter_condition['transaction_type'] = 'return'
        nxt = self.tbl.objects.filter(**filter_condition).order_by('id').first()
        if nxt is None:
            return None
        return model_to_dict(nxt)['id']

    def getPrevID(self):
        filter_condition = {'id__lt': self.frm_id}
        if self.module_name == 'sales' or self.module_name == 'purchase':
            filter_condition['transaction_type'] = self.module_name
        elif self.module_name == 'sales_return' or self.module_name == 'purchase_return':
            filter_condition['transaction_type'] = 'return'

        prev = self.tbl.objects.filter(**filter_condition).order_by('-id').first()
        if prev is None:
            return None
        return model_to_dict(prev)['id']

    def findId(self):
        return self.nextId() or self.prevId()

@csrf_exempt
def loginUser(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            username = data['username']
            password = data['password']

            user = tblUsers.objects.get(username=username)
        except user.DoesNotExist:
            return JsonResponse({ 'status': 'failed', 'message': 'Username does not exist'})
        
        
        user_login = authenticate(request, username=username, password=password)

        if user_login is not None:
            login(request, user_login)
            return JsonResponse({ 'status': 'success', 'message': model_to_dict(user) })
        else:
            return JsonResponse({ 'status': 'failed', 'message': 'Username and password do not match'})

@csrf_exempt
def registerUser(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data['username']
        password = data['password']
        email = data['email']

        if tblUsers.objects.filter(username=username).exists():
            return JsonResponse({ 'status': 'failed', 'message': 'Username already registered'})
            
        hashed_password = make_password(password)
        user = tblUsers.objects.create(
            username=username,
            email=email,
            password=hashed_password, 
        )
        user.save()
        # user_login = authenticate(request, username=username, password=password)

        # if user_login is not None:
        #     login(request, user_login)
        #     return redirect('home')

    return JsonResponse({ 'status': 'success', 'message': '' })

def logoutUser(request):
    logout(request)


def formSearch(request, tbl_name, tbl_field=None, field_code=None, tbl_field_2=None):
    try:
        model = apps.get_model(app_label='core', model_name=tbl_name)
        if tbl_field and field_code:
            filter_condition = Q(**{f"{tbl_field}__icontains": field_code})
            if tbl_field_2:
                filter_condition |= Q(**{f"{tbl_field_2}__icontains": field_code})
            results = model.objects.filter(filter_condition).values()
        elif field_code:
            if tbl_name == 'tblPurchaseOrder_Master':
                results = model.objects.filter(Q(vendor__vendor_name__icontains=field_code) | Q(order_no__icontains=field_code)).values()
            elif tbl_name == 'tblSalesOrder_Master':
                results = model.objects.filter(Q(customer__customer_name__icontains=field_code) | Q(order_no__icontains=field_code)).values()
            elif tbl_name == 'tblCategory':
                results = model.objects.filter(Q(category_code__icontains=field_code) | Q(category_name__icontains=field_code) | Q(vat_rate__icontains=field_code) | Q(type__icontains=field_code)).values()
            elif tbl_name == 'tblChartOfAccounts':
                results = model.objects.filter(Q(account_code__icontains=field_code) | Q(account_name__icontains=field_code)).values()
            elif tbl_name == 'tblProduct':
                results = model.objects.filter(Q(vendor__vendor_name__icontains=field_code) | Q(category__category_name__icontains=field_code) | Q(product_name__icontains=field_code) | Q(product_code__icontains=field_code)).values()
            elif tbl_name == 'tblCustomer':
                results = model.objects.filter(Q(customer_code__icontains=field_code) | Q(customer_name__icontains=field_code) | Q(email__icontains=field_code) | Q(mobile__icontains=field_code)).values()
            elif tbl_name == 'tblVendor':
                results = model.objects.filter(Q(vendor_code__icontains=field_code) | Q(vendor_name__icontains=field_code) | Q(email__icontains=field_code) | Q(mobile__icontains=field_code)).values()
            elif tbl_name == 'tblRFQ_Master':
                results = model.objects.filter(Q(rfq_no__icontains=field_code) | Q(vendor__vendor_name__icontains=field_code)).values()
            elif tbl_name == 'tblDeliveryNote_Master':
                results = model.objects.filter(Q(customer__customer_name__icontains=field_code) | Q(delivery_note_no__icontains=field_code)).values()
            elif tbl_name == 'tblQuotation_Master':
                results = model.objects.filter(Q(customer__customer_name__icontains=field_code) | Q(quotation_no__icontains=field_code)).values()
            elif tbl_name == 'tblPreforma_Master':
                results = model.objects.filter(Q(customer__customer_name__icontains=field_code) | Q(quotation_no__icontains=field_code)).values()
            elif tbl_name == 'tblJournalVoucher_Master':
                results = model.objects.filter(Q(jv_no__icontains=field_code)).values()
            elif tbl_name == 'tblPayment':
                results = model.objects.filter(Q(payment_no__icontains=field_code) | Q(payment_to__icontains=field_code) | Q(vendor__vendor_name__icontains=field_code)).values()
            elif tbl_name == 'tblReceipt':
                results = model.objects.filter(Q(receipt_no__icontains=field_code) | Q(receipt_from__icontains=field_code) | Q(customer__customer_name__icontains=field_code)).values()
            elif tbl_name == 'tblChequeTransfer':
                results = ChequeTransferSerializer(model.objects.filter(Q(transfer_no__icontains=field_code) | Q(cheque__cheque_no__icontains=field_code)))
        else:
            results = model.objects.all().values()
        # Create a list to store the modified data
        data = []
        # Extract the 'fields' from each entry and add the 'id' field
        for result in results:
            # if tbl_name == 'tblPurchase_Master' or tbl_name == 'tblPurchaseOrder_Master' or tbl_name == 'tblRFQ_Master' or tbl_name == 'tblPayment':
            if tbl_name == 'tblPurchaseOrder_Master' or tbl_name == 'tblRFQ_Master' or tbl_name == 'tblPayment':
                result['vendor_name'] = None if result['vendor_id'] is None else tblVendor.objects.get(id=result['vendor_id']).vendor_name
            # elif (tbl_name == 'tblSales_Master' or tbl_name == 'tblSalesOrder_Master' or tbl_name == 'tblQuotation_Master' or tbl_name == 'tblDeliveryNotes_Master' or 
            elif (tbl_name == 'tblSalesOrder_Master' or tbl_name == 'tblQuotation_Master' or tbl_name == 'tblDeliveryNotes_Master' or 
                tbl_name == 'tblReceipt' or tbl_name == 'tblPreforma_Master'):
                result['customer_name'] = None if result['customer_id'] is None else tblCustomer.objects.get(id=result['customer_id']).customer_name
            elif tbl_name == 'tblProduct':
                if result['vendor_id']:
                    result['vendor_name'] = None if result['vendor_id'] is None else tblVendor.objects.get(id=result['vendor_id']).vendor_name
                if result['category_id']:
                    result['category_name'] = None if result['category_id'] is None else tblCategory.objects.get(id=result['category_id']).category_name
                
            data.append(result)
        # Return the modified data as JSON response
        return JsonResponse(data, safe=False)

    except model.DoesNotExist:
        return JsonResponse({})
    except Exception as e:
        return JsonResponse({})

def invoiceSearch(request, sales_or_purchase, transaction_type, tbl_field=None, field_code=None, tbl_field_2=None):
    try:
        model = apps.get_model(app_label='core', model_name='tblPurchase_Master' if sales_or_purchase == 'purchase' else 'tblSales_Master')
        filter_conditions = Q(transaction_type=transaction_type)  # Add this filter condition for transaction_type

        if tbl_field and field_code:
            filter_condition = Q(**{f"{tbl_field}__icontains": field_code})
            if tbl_field_2:
                filter_condition |= Q(**{f"{tbl_field_2}__icontains": field_code})
            results = model.objects.filter(filter_conditions & filter_condition).values()
        elif field_code:
            if sales_or_purchase == 'purchase':
                results = model.objects.filter(filter_conditions & (Q(vendor__vendor_name__icontains=field_code) | Q(invoice_no__icontains=field_code) | Q(purchase_no__icontains=field_code) | Q(return_no__icontains=field_code))).values()
            elif sales_or_purchase == 'sales':
                results = model.objects.filter(filter_conditions & (Q(customer__customer_name__icontains=field_code) | Q(invoice_no__icontains=field_code) | Q(return_no__icontains=field_code))).values()
        else:
            results = model.objects.filter(filter_conditions).values()
        # Create a list to store the modified 
        data = []

        # Extract the 'fields' from each entry and add the 'id' field
        for result in results:
            if sales_or_purchase == 'purchase':
                result['vendor_name'] = tblVendor.objects.get(id=result['vendor_id']).vendor_name
            else:
                result['customer_name'] = tblCustomer.objects.get(id=result['customer_id']).customer_name
                
            data.append(result)
        # Return the modified data as JSON response
        return JsonResponse(data, safe=False)

    except model.DoesNotExist:
        return JsonResponse({})
    except Exception as e:
        return JsonResponse({})
    
def accountsReceivables(request):
    accounts_receivables = tblAccountsReceivables.objects.filter(balance__gt = 0).order_by('due_date')
    serializer = AccountsReceivablesSerializer(accounts_receivables, many=True)

    return JsonResponse(serializer.data, safe=False)
    
def accountsPayables(request):
    accounts_payables = tblAccountsPayables.objects.filter(balance__gt = 0).order_by('due_date')
    serializer = AccountsPayablesSerializer(accounts_payables, many=True)

    return JsonResponse(serializer.data, safe=False)

def cheques(request):
    # Get IDs of tblCheques instances referenced in ChequeTransfer
    excluded_cheques = tblChequeTransfer.objects.values_list('cheque__id', flat=True)

    # Query tblCheques excluding those referenced in ChequeTransfer
    payed = ChequeSerializer(tblCheques.objects.exclude(id__in=excluded_cheques).filter(is_issued=True), many=True)
    received = ChequeSerializer(tblCheques.objects.exclude(id__in=excluded_cheques).filter(is_issued=False), many=True)

    return JsonResponse({ 'payed': payed.data, 'received': received.data })

def get_csrf_token(request):
    if request.method == 'GET':
        return JsonResponse({'csrfToken': get_token(request)})



    

@csrf_exempt
@transaction.atomic
def company_information(request, id = 0):
    if request.method == 'GET':
        company = get_object_or_404(tblCompanyInformation, id=id) if id else tblCompanyInformation.objects.last()

        if company is None:
            return JsonResponse({})

        company_serializer = CompanySerializer(company)

        return JsonResponse(company_serializer.data, safe=False)
    
    elif request.method == 'POST':
        company_data = JSONParser().parse(request)
        company_serializer = CompanySerializer(data=company_data)
        if company_serializer.is_valid():
            company_serializer.save()
            return JsonResponse({"id":company_serializer.instance.id, "status": "success", "message": "Successfully saved Company Information"})
        return JsonResponse({"status": "failed", "message": "Failed to save Company Information"})
    
    elif request.method == "PUT":
        company = tblCompanyInformation.objects.get(id=1)
        company_data = JSONParser().parse(request)
        company_serializer = CompanySerializer(company, data=company_data)
        if company_serializer.is_valid():
            company_serializer.save()
            return JsonResponse({"id":company_serializer.instance.id, "status": "success", "message": "Successfully saved Company Information"})
        return JsonResponse({"status": "failed", "message": "Failed to save Company Information"})

@csrf_exempt
@transaction.atomic
def category(request, id = 0):
    if request.method == 'GET':
        category = get_object_or_404(tblCategory, id=id) if id else tblCategory.objects.last()
        
        if category is None:
            return JsonResponse({})
        
        category_serializer = CategorySerializer(category)
        
        # Create an instance of idExists class
        id_checker = idExists(tblCategory, category.id, 'category')

        # Include the idExists results in the response data
        response_data = {
            'data': category_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
            }
        }

        return JsonResponse(response_data, safe=False)
    
    elif request.method == 'POST':
        category_data = JSONParser().parse(request)
        category_serializer = CategorySerializer(data=category_data)
        if category_serializer.is_valid():
            category_serializer.save()
            return JsonResponse({"id":category_serializer.instance.id, "status": "success", "message": "Successfully saved the Category"})
        return JsonResponse({"status": "failed", "message": "Failed to save the Category"})
    
    elif request.method == "PUT":
        category = tblCategory.objects.get(id=id)
        category_data = JSONParser().parse(request)
        category_serializer = CategorySerializer(category, data=category_data)
        if category_serializer.is_valid():
            category_serializer.save()
            return JsonResponse({"id":category_serializer.instance.id, "status": "success", "message": "Successfully saved the Category"})
        return JsonResponse({"status": "failed", "message": "Failed to save the Category"})
    
    elif request.method == 'DELETE':
        try:
            category = tblCategory.objects.get(id=id)
            category.delete()
            return JsonResponse({"status": "success", "message": "Successfully deleted the Category"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", "message": "Failed to delete the Category"})

@csrf_exempt
@transaction.atomic
def employee(request, id = 0):
    if request.method == 'GET':
        employee = get_object_or_404(tblEmployee, id=id) if id else tblEmployee.objects.last()
        
        if employee is None:
            return JsonResponse({})
        
        employee_serializer = EmployeeSerializer(employee)
        
        # Create an instance of idExists class
        id_checker = idExists(tblEmployee, employee.id, 'employee')

        # Include the idExists results in the response data
        response_data = {
            'data': employee_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
            }
        }

        return JsonResponse(response_data, safe=False)
    
    elif request.method == 'POST':
        employee_data = JSONParser().parse(request)
        employee_data['employee_code'] = employee_data.get('employee_code', '').upper()
        employee_data['employee_name'] = employee_data.get('employee_name', '').upper()
        
        employee_serializer = EmployeeSerializer(data=employee_data)
        if employee_serializer.is_valid():
            employee_serializer.save()
            return JsonResponse({"id": employee_serializer.instance.id, "status": "success", "message": "Successfully saved the Employee"}, safe=False)
        return JsonResponse({"status": "failed", "message": "Failed to save the Employee"}, safe=False)
    
    elif request.method == "PUT":
        employee = tblEmployee.objects.get(id=id)
        employee_data = JSONParser().parse(request)
        employee_data['employee_code'] = employee_data.get('employee_code', '').upper()
        employee_data['employee_name'] = employee_data.get('employee_name', '').upper()

        employee_serializer = EmployeeSerializer(employee, data=employee_data)
        if employee_serializer.is_valid():
            employee_serializer.save()
            return JsonResponse({"id": employee_serializer.instance.id, "status": "success", "message": "Successfully saved the Employee"}, safe=False)
        return JsonResponse({"status": "failed", "message": "Failed to save the Employee"}, safe=False)
    
    elif request.method == 'DELETE':
        try:
            employee = tblEmployee.objects.get(id=id)
            employee.delete()
            return JsonResponse({"status": "success", "message": "Successfully deleted the Employee"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", "message": "Failed to delete the Employee"})

@csrf_exempt
@transaction.atomic
def customer(request, id = 0):
    if request.method == 'GET':
        customer = get_object_or_404(tblCustomer, id=id) if id else tblCustomer.objects.last()

        if customer is None:
            return JsonResponse({})

        customer_serializer = CustomerSerializer(customer)
        
        # Create an instance of idExists class
        id_checker = idExists(tblCustomer, customer.id, 'customer')

        # Include the idExists results in the response data
        response_data = {
            'data': customer_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
            }
        }

        return JsonResponse(response_data, safe=False)
    
    elif request.method == 'POST':
        customer_data = JSONParser().parse(request)
        customer_data['customer_code'] = customer_data.get('customer_code', '').upper()
        customer_data['customer_name'] = customer_data.get('customer_name', '').upper()
        
        for field in ['credit_balance', 'credit_alert', 'credit_days', 'credit_block']:
            if field in customer_data and customer_data[field] == '':
                customer_data[field] = None
        
        customer_serializer = CustomerSerializer(data=customer_data)
        if customer_serializer.is_valid():
            customer_serializer.save()
            return JsonResponse({"id": customer_serializer.instance.id, "status": "success", "message": "Successfully saved the Customer"}, safe=False)
        return JsonResponse({"status": "failed", "message": "Failed to save the Customer"}, safe=False)
    
    elif request.method == "PUT":
        customer = tblCustomer.objects.get(id=id)
        customer_data = JSONParser().parse(request)
        customer_data['customer_code'] = customer_data.get('customer_code', '').upper()
        customer_data['customer_name'] = customer_data.get('customer_name', '').upper()
        
        for field in ['credit_balance', 'credit_alert', 'credit_days']:
            if field in customer_data and customer_data[field] == '':
                customer_data[field] = None
        
        customer_serializer = CustomerSerializer(customer, data=customer_data)
        if customer_serializer.is_valid():
            customer_serializer.save()
            return JsonResponse({"id": customer_serializer.instance.id, "status": "success", "message": "Successfully saved the Customer"}, safe=False)
        return JsonResponse({"status": "failed", "message": "Failed to save the Customer"}, safe=False)
    
    elif request.method == 'DELETE':
        try:
            customer = tblCustomer.objects.get(id=id)
            customer.delete()
            return JsonResponse({"status": "success", "message": "Failed to delete the Customer"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", "message": "Failed to delete the Customer"})

@csrf_exempt
@transaction.atomic
def vendor(request, id = 0):
    if request.method == 'GET':
        vendor = get_object_or_404(tblVendor, id=id) if id else tblVendor.objects.last()

        if vendor is None:
            return JsonResponse({})

        vendor_serializer = VendorSerializer(vendor)
        
        # Create an instance of idExists class
        id_checker = idExists(tblVendor, vendor.id, 'vendor')

        # Include the idExists results in the response data
        response_data = {
            'data': vendor_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
            }
        }

        return JsonResponse(response_data, safe=False)
    
    elif request.method == 'POST':
        vendor_data = JSONParser().parse(request)
        vendor_data['vendor_code'] = vendor_data.get('vendor_code', '').upper()
        vendor_data['vendor_name'] = vendor_data.get('vendor_name', '').upper()

        for field in ['credit_balance', 'credit_alert', 'credit_days', 'credit_block']:
            if field in vendor_data and vendor_data[field] == '':
                vendor_data[field] = None
        
        vendor_serializer = VendorSerializer(data=vendor_data)
        if vendor_serializer.is_valid():
            vendor_serializer.save()
            return JsonResponse({'id':vendor_serializer.instance.id, "status": "success", "message": "Successfully saved the Vendor"}, safe=False)
        return JsonResponse({"status": "failed", "message": "Failed to save the Vendor"}, safe=False)
    
    elif request.method == "PUT":
        vendor = tblVendor.objects.get(id=id)
        vendor_data = JSONParser().parse(request)
        vendor_data['vendor_code'] = vendor_data.get('vendor_code', '').upper()
        vendor_data['vendor_name'] = vendor_data.get('vendor_name', '').upper()

        for field in ['credit_balance', 'credit_alert', 'credit_days']:
            if field in vendor_data and vendor_data[field] == '':
                vendor_data[field] = None
        
        vendor_serializer = VendorSerializer(vendor, data=vendor_data)
        if vendor_serializer.is_valid():
            vendor_serializer.save()
            return JsonResponse({'id':vendor_serializer.instance.id, "status": "success", "message": "Successfully saved the Vendor"}, safe=False)
        return JsonResponse({"status": "failed", "message": "Failed to save the Vendor"}, safe=False)
    
    elif request.method == 'DELETE':
        try:
            vendor = tblVendor.objects.get(id=id)
            vendor.delete()
            return JsonResponse({"status": "success", "message": "Successfully deleted the Vendor"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", "message": "Failed to delete the Vendor"})


@csrf_exempt
@transaction.atomic
def product(request, id = None):
    if request.method == 'GET':
        product = get_object_or_404(tblProduct, id=id) if id else tblProduct.objects.last()
        
        if product is None:
            return JsonResponse({})
        
        product_serializer = ProductSerializer(product)

        units = tblProduct_unit.objects.filter(product=product)
        unit_serializer = ProductUnitSerializer(units, many=True)
        
        # Create an instance of idExists class
        id_checker = idExists(tblProduct, product.id, 'product')

        # Include the idExists results in the response data
        response_data = {
            'master_data': product_serializer.data,
            'details_data': unit_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
            }
        }

        return JsonResponse(response_data, safe=False)
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))
                
                master_data = data['master_data']
                details_data = data['details_data']

                multiple_units = False if details_data[0]['unit'] == '' else True
                description = master_data['description'] if 'description' in master_data else ''
                cost_price = to_decimal(master_data['cost_price']) if 'cost_price' in master_data else 0
                last_purchase_price = to_decimal(master_data['last_purchase_price']) if 'last_purchase_price' in master_data else 0
                selling_price = to_decimal(master_data['selling_price']) if 'selling_price' in master_data else 0
                stock = to_decimal(master_data['stock']) if 'stock' in master_data else 0
                stock_on_delivery = to_decimal(master_data['stock_on_delivery']) if 'stock_on_delivery' in master_data else 0
                vat_perc = to_decimal(master_data['vat_perc']) if 'vat_perc' in master_data else 0
                vendor = to_integer(master_data['vendor']) if 'vendor' in master_data else 0
                category = to_integer(master_data['category_id']) if 'category_id' in master_data else 0
                inventory_account = to_integer(master_data['inventory_account']) if 'inventory_account' in master_data else 0
                cost_account = to_integer(master_data['cost_account']) if 'cost_account' in master_data else 0
                income_account = to_integer(master_data['income_account']) if 'income_account' in master_data else 0

                if id:
                    product = tblProduct.objects.get(id=id)
                    product.product_code = master_data['product_code'].upper()
                    product.product_name = master_data['product_name'].upper()
                    product.main_unit = master_data['main_unit']
                    product.multiple_units = multiple_units
                    product.description = description
                    product.cost_price = cost_price
                    product.last_purchase_price = last_purchase_price
                    product.selling_price = selling_price
                    product.type = master_data['type']
                    product.stock = stock
                    product.stock_on_delivery = stock_on_delivery
                    product.vat_perc = vat_perc
                    product.vendor = tblVendor.objects.get(id = vendor) if vendor > 0 else None
                    product.category = tblCategory.objects.get(id = category) if category > 0 else None
                    product.inventory_account = tblChartOfAccounts.objects.get(id = inventory_account) if inventory_account > 0 else None
                    product.cost_account = tblChartOfAccounts.objects.get(id = cost_account) if cost_account > 0 else None
                    product.income_account = tblChartOfAccounts.objects.get(id = income_account) if income_account > 0 else None
                    product.save()
                    sub_unit = tblProduct_unit.objects.filter(product = id)
                    sub_unit.delete()
                else:
                    product = tblProduct.objects.create(
                        product_code = master_data['product_code'].upper(),
                        product_name = master_data['product_name'].upper(),
                        main_unit = master_data['main_unit'],
                        multiple_units = multiple_units,
                        description = description,
                        cost_price = cost_price,
                        last_purchase_price = last_purchase_price,
                        selling_price = selling_price,
                        type = master_data['type'],
                        stock = stock,
                        stock_on_delivery = stock_on_delivery,
                        vat_perc = vat_perc,
                        vendor = tblVendor.objects.get(id = vendor) if vendor > 0 else None,
                        category = tblCategory.objects.get(id = category) if category > 0 else None,
                        inventory_account = tblChartOfAccounts.objects.get(id = inventory_account) if inventory_account > 0 else None,
                        cost_account = tblChartOfAccounts.objects.get(id = cost_account) if cost_account > 0 else None,
                        income_account = tblChartOfAccounts.objects.get(id = income_account) if income_account > 0 else None
                    )


                if multiple_units:
                    for unit in details_data:
                        tblProduct_unit.objects.create(
                            product = product,
                            unit = unit['unit'],
                            multiple = unit['multiple'],
                            multiple_value = to_decimal(unit['multiple_value']),
                        )


                return JsonResponse({'status':  'success', 'id': product.id, "message": "Successfully saved the Product"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Product'})
        
    elif request.method == 'DELETE':
        try:
            product = tblProduct.objects.get(id=id)
            product.delete()
            return JsonResponse({"status": "success", "message": 'Successfully deleted the Product'})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to delete the Product'})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})

@csrf_exempt
@transaction.atomic
def productUnit(request, id = 0):
    if request.method == 'GET':
        productUnit = tblProduct_unit.objects.filter(product_id = id)
        productUnit_serializer = ProductUnitSerializer(productUnit, many=True)
        return JsonResponse(productUnit_serializer.data, safe=False)

@csrf_exempt
@transaction.atomic
def account(request, id = 0):
    if request.method == 'GET':
        account = get_object_or_404(tblChartOfAccounts, id=id) if id else tblChartOfAccounts.objects.last()
        
        if account is None:
            return JsonResponse({})
        
        account_serializer = AccountSerializer(account)
        
        # Create an instance of idExists class
        id_checker = idExists(tblChartOfAccounts, account.id, 'account')

        # Include the idExists results in the response data
        response_data = {
            'data': account_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
            }
        }

        return JsonResponse(response_data, safe=False)
    
    elif request.method == 'POST':
        account_data = JSONParser().parse(request)
        account_data['account_code'] = account_data.get('account_code', '').upper()
        account_data['account_name'] = account_data.get('account_name', '').upper()

        account_serializer = AccountSerializer(data=account_data)
        if account_serializer.is_valid():
            account_serializer.save()
            return JsonResponse({'id': account_serializer.instance.id, "status": "success", "message": "Successfully saved the Account"}, safe=False)
        return JsonResponse({"status": "failed", "message": "Failed to save the Account"}, safe=False)
    
    elif request.method == "PUT":
        account = tblChartOfAccounts.objects.get(id=id)
        account_data = JSONParser().parse(request)
        account_data['account_code'] = account_data.get('account_code', '').upper()
        account_data['account_name'] = account_data.get('account_name', '').upper()

        account_serializer = AccountSerializer(account, data=account_data)
        if account_serializer.is_valid():
            account_serializer.save()
            return JsonResponse({'id': account_serializer.instance.id, "status": "success", "message": "Successfully saved the Account"}, safe=False)
        return JsonResponse({"status": "failed", "message": "Failed to save the Account"}, safe=False)
    
    elif request.method == 'DELETE':
        try:
            account = tblChartOfAccounts.objects.get(id=id)
            account.delete()
            return JsonResponse({"status": "success", "message": "Successfully deleted the Account"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "success", "message": "Failed to delete the Account"})
    
    
@csrf_exempt
@transaction.atomic
def sales(request, id=None):
    to_return = 'sales_return' in request.path
    if request.method == 'GET':
        sales = get_object_or_404(tblSales_Master, id=id, transaction_type='return' if to_return else 'sales') if id else tblSales_Master.objects.filter(transaction_type='return' if to_return else 'sales').last()
        
        if sales is None:
            return JsonResponse({})
        
        serializer = SalesSerializer(sales)

        details = tblSales_Details.objects.filter(sales=sales.id)
        details_serializer = SalesDetailsSerializer(details, many=True)

        # Create an instance of idExists class
        id_checker = idExists(tblSales_Master, sales.id, 'sales_return' if to_return else 'sales')

        next_no = to_integer(tblSales_Master.objects.aggregate(max_return_no = Max('return_no'))['max_return_no'] if to_return else tblSales_Master.objects.aggregate(max_invoice_no = Max('invoice_no'))['max_invoice_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': serializer.data,
            'details_data': details_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        

    if request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                master_data = data['master_data']
                details_data = data['details_data']

                total = to_decimal(master_data['total']) if 'total' in master_data else 0
                vat = to_decimal(master_data['vat']) if 'vat' in master_data else 0
                discount = to_decimal(master_data['discount']) if 'discount' in master_data else 0
                roundoff = to_decimal(master_data['roundoff']) if 'roundoff' in master_data else 0
                net_amount = to_decimal(master_data['net_amount']) if 'net_amount' in master_data else 0
                amount_received = to_decimal(master_data['amount_received']) if 'amount_received' in master_data else 0
                balance = to_decimal(master_data['balance']) if 'balance' in master_data else 0
                payment_method = master_data['payment_method'] if 'payment_method' in master_data else 'Cash'
                customer_id = to_integer(master_data['customer']) if 'customer' in master_data else 0
                salesman = to_integer(master_data['salesman']) if 'salesman' in master_data else 0
                customer = tblCustomer.objects.get(id=customer_id) if customer_id > 0 else None
                if id:
                    sales = tblSales_Master.objects.get(id=id)

                    if to_return:
                        accounts_receivable = tblAccountsReceivables.objects.get(invoice = tblSales_Master.objects.get(invoice_no = sales.invoice_no, transaction_type = 'sales'))
                        if accounts_receivable:
                            # if accounts_receivable.balance < accounts_receivable.amount:
                            #     return JsonResponse({"status": "failed", 'message': 'The Invoice Associated with this is fully/partially settled'})
                            accounts_receivable.amount = accounts_receivable.amount + sales.balance
                            accounts_receivable.balance = accounts_receivable.balance + sales.balance
                            accounts_receivable.save()
                        customer.credit_balance = to_decimal(customer.credit_balance) + to_decimal(sales.balance)
                    else:
                        accounts_receivable = tblAccountsReceivables.objects.get(invoice = sales)
                        if accounts_receivable:
                            if accounts_receivable.balance < accounts_receivable.amount:
                                return JsonResponse({"status": "failed", 'message': 'This Invoice is fully/partially settled'})
                            accounts_receivable.delete()
                        customer.credit_balance = to_decimal(customer.credit_balance) - to_decimal(sales.balance)
                            
                    sales.invoice_no = master_data['invoice_no']
                    sales.return_no = master_data['return_no'] if to_return else ''
                    sales.invoice_date = master_data['invoice_date']
                    sales.total = total
                    sales.vat = vat
                    sales.discount = discount
                    sales.roundoff = roundoff
                    sales.net_amount = net_amount
                    sales.amount_received = amount_received
                    sales.balance = balance
                    sales.payment_method = payment_method
                    sales.cheque_no = master_data['cheque_no']
                    sales.cheque_date = master_data['cheque_date']
                    sales.customer = customer
                    sales.salesman = tblEmployee.objects.get(id=salesman) if salesman > 0 else None
                    sales.save()
                    sales_details = tblSales_Details.objects.filter(sales = id)
                    for details in sales_details.values():
                        product = tblProduct.objects.get(id = details['product_id'])
                        
                        if product.main_unit == details['unit']:
                            multiple = 1
                        else:
                            prod_unit = tblProduct_unit.objects.get(product = product, unit = details['unit'])
                            if prod_unit.multiple == '*':
                                multiple = 1/to_decimal(prod_unit.multiple_value)
                            else:
                                multiple = to_decimal(prod_unit.multiple_value)
                        if (to_return):
                            if (to_decimal(product.stock) - (to_decimal(details['qty'])*multiple)) == 0:
                                product.cost_price = 0
                            else:
                                product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))-(to_decimal(details['price'])*to_decimal(details['qty'])))/(to_decimal(product.stock) - (to_decimal(details['qty'])*multiple))
                            product.stock = to_decimal(product.stock) - (to_decimal(details['qty']) * multiple)
                        else:
                            product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))+(to_decimal(details['price'])*to_decimal(details['qty'])))/(to_decimal(product.stock) + (to_decimal(details['qty'])*multiple))
                            product.stock = to_decimal(product.stock) + (to_decimal(details['qty']) * multiple)
                        product.save()
                    sales_details.delete()
                    jv = tblJournalVoucher_Master.objects.get(master_id = id, transaction_type = 'SR' if to_return else 'SA')
                    jv.delete()
                    cheque = tblCheques.objects.get(sales = sales)
                    cheque.delete()
                else:
                    sales = tblSales_Master.objects.create(
                        invoice_no = master_data['invoice_no'],
                        return_no = master_data['return_no'] if to_return else '',
                        invoice_date = master_data['invoice_date'],
                        total = total,
                        vat = vat,
                        discount = discount,
                        roundoff = roundoff,
                        net_amount = net_amount,
                        amount_received = amount_received,
                        balance = balance,
                        payment_method = payment_method,
                        cheque_no = master_data['cheque_no'],
                        cheque_date = master_data['cheque_date'],
                        customer = customer,
                        salesman = tblEmployee.objects.get(id=salesman) if salesman > 0 else None,
                        transaction_type = 'return' if to_return else 'sales'
                    )
                if (to_return):
                    customer.credit_balance = to_decimal(customer.credit_balance) - balance
                else:
                    customer.credit_balance = to_decimal(customer.credit_balance) + balance
                customer.save()

                cost_price = 0
                for details in details_data:
                    product = tblProduct.objects.get(id=details['product'])
                    unit = details['unit']
                    stock = to_decimal(details['stock']) if 'stock' in details else None
                    qty = to_decimal(details['qty'])
                    price = to_decimal(details['price'])
                    vat_perc = to_decimal(details['vat_perc'])
                    item_vat = to_decimal(details['item_vat'])
                    item_discount = to_decimal(details['item_discount'])
                    item_total = to_decimal(details['item_total'])

                    tblSales_Details.objects.create(
                        sales = sales,
                        product = product,
                        product_name = details['product_name'],
                        unit = unit,
                        stock = stock,
                        qty = qty,
                        price = price,
                        vat_perc = vat_perc,
                        item_vat = item_vat,
                        item_discount = item_discount,
                        item_total = item_total,
                    )

                    if product.main_unit == unit:
                        multiple = 1
                    else:
                        prod_unit = tblProduct_unit.objects.get(product = product, unit = unit)
                        if prod_unit.multiple == '*':
                            multiple = 1/to_decimal(prod_unit.multiple_value)
                        else:
                            multiple = to_decimal(prod_unit.multiple_value)

                    if (to_return):
                        product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))+(price * qty))/(to_decimal(product.stock) + (qty * multiple))
                        product.stock = to_decimal(product.stock) + (qty * multiple)
                    else:
                        if (to_decimal(product.stock) - (qty * multiple)) == 0:
                            product.cost_price = 0
                        else:
                            product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))-(price * qty))/(to_decimal(product.stock) - (qty * multiple))
                        product.stock = to_decimal(product.stock) - (qty * multiple)
                    product.save()
                    cost_price += qty * product.cost_price

                if to_return and (balance > 0 or payment_method == 'Cheque'):
                    accounts_receivable = tblAccountsReceivables.objects.get(invoice=tblSales_Master.objects.get(invoice_no = master_data['invoice_no'], transaction_type = 'sales'))
                    accounts_receivable.amount = accounts_receivable.amount - balance
                    accounts_receivable.balance = accounts_receivable.balance - balance
                    accounts_receivable.save()
                elif balance > 0 or payment_method == 'Cheque':
                    tblAccountsReceivables.objects.create(
                        customer=customer,
                        invoice=sales,
                        due_date=datetime.strptime(master_data['invoice_date'], "%Y-%m-%d") + timedelta(days=to_integer(customer.credit_days)),
                        amount = balance,
                        balance = balance
                    )

                journalVoucher = tblJournalVoucher_Master.objects.create(
                    jv_no = to_integer(tblJournalVoucher_Master.objects.aggregate(max_jv_no = Max('jv_no'))['max_jv_no']) + 1,
                    jv_date = master_data['invoice_date'],
                    debit = net_amount,
                    credit = net_amount,
                    transaction_type = 'SR' if to_return else 'SA',
                    master_id = sales.id
                )
                
                if amount_received > 0:
                    if payment_method == 'Cash': 
                        account_code = 10001
                    elif payment_method == 'Bank Transfer':
                        account_code = 10101
                    elif payment_method == 'Cheque':
                        account_code = 280001 if to_return else 180001
                        tblCheques.objects.create(
                            cheque_no = master_data['cheque_no'],
                            cheque_date = master_data['cheque_date'],
                            is_issued = True if to_return else False,
                            sales = sales,
                            transaction_type = 'SA'
                        )
                    else:
                        account_code = 10102

                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = account_code),
                        name = '',
                        debit = 0 if to_return else amount_received,
                        credit = amount_received if to_return else 0,
                        amount = -1 * amount_received if to_return else amount_received
                    )

                if balance > 0:
                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = 11001),
                        name = customer.id,
                        debit = 0 if to_return else balance,
                        credit = balance if to_return else 0,
                        amount = -1 * balance if to_return else balance
                    )
                    
                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = 40002 if to_return else 40001),
                    name = '',
                    debit = net_amount if to_return else 0,
                    credit = 0 if to_return else net_amount,
                    amount = net_amount if to_return else -1 * net_amount
                )

                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = 150001),
                    name = '',
                    debit = net_amount if to_return else 0,
                    credit = 0 if to_return else net_amount,
                    amount = net_amount if to_return else -1 * net_amount
                )

                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = 40000),
                    name = '',
                    debit = net_amount if to_return else 0,
                    credit = 0 if to_return else net_amount,
                    amount = net_amount if to_return else -1 * net_amount
                )

                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = 50000),
                    name = '',
                    debit = cost_price if to_return else 0,
                    credit = 0 if to_return else cost_price,
                    amount = cost_price if to_return else -1 * cost_price
                )



                return JsonResponse({'id': sales.id, "status": "success", "message": "Successfully saved the Invoice"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Invoice'})

    elif request.method == 'DELETE':    
        try:
            with transaction.atomic():
                sales = tblSales_Master.objects.get(id=id)
                if sales.transaction_type == 'return':
                    accounts_receivable = tblAccountsReceivables.objects.get(invoice = tblSales_Master.objects.get(invoice_no = sales.invoice_no, transaction_type = 'sales'))
                    if accounts_receivable:
                        # if accounts_receivable.balance < accounts_receivable.amount:
                            # return JsonResponse({"status": "failed", 'message': 'The Invoice Associated with this is fully/partially settled'})
                        accounts_receivable.balance = accounts_receivable.balance + sales.balance
                        accounts_receivable.amount = accounts_receivable.amount + sales.balance
                else:
                    accounts_receivable = tblAccountsReceivables.objects.get(invoice = sales)
                    if accounts_receivable:
                        if accounts_receivable.balance < accounts_receivable.amount:
                            return JsonResponse({"status": "failed", 'message': 'This Invoice is fully/partially settled'})


                customer = tblCustomer.objects.get(id = sales.customer.id)
                if sales.transaction_type == 'return':
                    customer.credit_balance = to_decimal(customer.credit_balance) + to_decimal(sales.balance)
                else:
                    customer.credit_balance = to_decimal(customer.credit_balance) - to_decimal(sales.balance)
                customer.save()
                tbl_detail = tblSales_Details.objects.filter(sales = sales.id)
                for details in tbl_detail:
                    product = tblProduct.objects.get(id = details.product.id)
                    
                    if product.main_unit == details.unit:
                        multiple = 1
                    else:
                        prod_unit = tblProduct_unit.objects.get(product = product, unit = details.unit)
                        if prod_unit.multiple == '*':
                            multiple = 1/to_decimal(prod_unit.multiple_value)
                        else:
                            multiple = to_decimal(prod_unit.multiple_value)
                    if sales.transaction_type == 'return':
                        if (to_decimal(product.stock) - (to_decimal(details.qty)*multiple)) == 0:
                            product.cost_price = 0
                        else:
                            product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))-(to_decimal(details.price)*to_decimal(details.qty)))/(to_decimal(product.stock) - (to_decimal(details.qty)*multiple))
                        product.stock = to_decimal(product.stock) - (to_decimal(details.qty) * multiple)
                    else:
                        product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))+(to_decimal(details.price)*to_decimal(details.qty)))/(to_decimal(product.stock) + (to_decimal(details.qty)*multiple))
                        product.stock = to_decimal(product.stock) + (to_decimal(details.qty) * multiple)
                    product.save()
                jv = tblJournalVoucher_Master.objects.get(master_id = sales.id, transaction_type = 'SR' if to_return else 'SA')
                jv.delete()
                sales.delete()
                return JsonResponse({"status": "success", "message": "Successfully deleted the Invoice"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "success", "message": "Failed to delete the Invoice"})

    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})
    
@csrf_exempt
@transaction.atomic
def purchase(request, id=None):
    to_return = 'purchase_return' in request.path
    if request.method == 'GET':
        purchase = get_object_or_404(tblPurchase_Master, id=id, transaction_type='return' if to_return else 'purchase') if id else tblPurchase_Master.objects.filter(transaction_type='return' if to_return else 'purchase').last()
        
        if purchase is None:
            return JsonResponse({})
        
        serializer = PurchaseSerializer(purchase)

        details = tblPurchase_Details.objects.filter(purchase=purchase.id)
        details_serializer = PurchaseDetailsSerializer(details, many=True)

        
        # Create an instance of idExists class
        id_checker = idExists(tblPurchase_Master, purchase.id, 'purchase_return' if to_return else 'purchase')


        next_no = to_integer(tblPurchase_Master.objects.aggregate(max_return_no = Max('return_no'))['max_return_no'] if to_return else tblPurchase_Master.objects.aggregate(max_invoice_no = Max('invoice_no'))['max_invoice_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': serializer.data,
            'details_data': details_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        

    if request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                master_data = data['master_data']
                details_data = data['details_data']
                # print(master_data, details_data)

                total = to_decimal(master_data['total']) if 'total' in master_data else 0
                vat = to_decimal(master_data['vat']) if 'vat' in master_data else 0
                discount = to_decimal(master_data['discount']) if 'discount' in master_data else 0
                roundoff = to_decimal(master_data['roundoff']) if 'roundoff' in master_data else 0
                net_amount = to_decimal(master_data['net_amount']) if 'net_amount' in master_data else 0
                amount_payed = to_decimal(master_data['amount_payed']) if 'amount_payed' in master_data else 0
                balance = to_decimal(master_data['balance']) if 'balance' in master_data else 0
                payment_method = master_data['payment_method'] if 'payment_method' in master_data else 'Cash'
                vendor_id = to_integer(master_data['vendor']) if 'vendor' in master_data else 0
                salesman_id = to_integer(master_data['salesman']) if 'salesman' in master_data else 0
                vendor = tblVendor.objects.get(id=vendor_id) if vendor_id > 0 else None
                salesman = tblEmployee.objects.get(id=salesman_id) if salesman_id > 0 else None
                if id:
                    purchase = tblPurchase_Master.objects.get(id=id)
                    
                    if to_return:
                        accounts_payables = tblAccountsPayables.objects.get(invoice = tblPurchase_Master.objects.get(invoice_no = purchase.invoice_no, transaction_type="purchase"))
                        if accounts_payables:
                            # if accounts_payables.balance < accounts_payables.amount:
                            #     return JsonResponse({"status": "failed", 'message': 'The Invoice Associated with this is fully/partially settled'})
                            accounts_payables.amount = accounts_payables.amount + purchase.balance
                            accounts_payables.balance = accounts_payables.balance + purchase.balance
                            accounts_payables.save()
                        vendor.credit_balance = to_decimal(vendor.credit_balance) + to_decimal(purchase.balance)
                    else:
                        accounts_payables = tblAccountsPayables.objects.get(invoice = purchase)
                        if accounts_payables:
                            if accounts_payables.balance < accounts_payables.amount:
                                return JsonResponse({"status": "failed", 'message': 'This Invoice is fully/partially settled'})
                            accounts_payables.delete()
                        vendor.credit_balance = to_decimal(vendor.credit_balance) - to_decimal(purchase.balance)

                    purchase.invoice_no = master_data['invoice_no']
                    purchase.return_no = master_data['return_no'] if to_return else ''
                    purchase.purchase_no = master_data['purchase_no']
                    purchase.invoice_date = master_data['invoice_date']
                    purchase.total = total
                    purchase.vat = vat
                    purchase.discount = discount
                    purchase.roundoff = roundoff
                    purchase.net_amount = net_amount
                    purchase.amount_payed = amount_payed
                    purchase.balance = balance
                    purchase.payment_method = payment_method
                    purchase.cheque_no = master_data['cheque_no']
                    purchase.cheque_date = master_data['cheque_date']
                    purchase.vendor = vendor
                    purchase.salesman = salesman
                    purchase.save()
                    purchase_details = tblPurchase_Details.objects.filter(purchase = id)
                    for details in purchase_details:
                        product = tblProduct.objects.get(id = details.product.id)
                        
                        if product.main_unit == details.unit:
                            multiple = 1
                        else:
                            prod_unit = tblProduct_unit.objects.get(product = product, unit = details.unit)
                            if prod_unit.multiple == '*':
                                multiple = 1/to_decimal(prod_unit.multiple_value)
                            else:
                                multiple = to_decimal(prod_unit.multiple_value)

                        if (to_return):
                            product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))+(to_decimal(details.price)*to_decimal(details.qty)))/(to_decimal(product.stock) + (to_decimal(details.qty)*multiple))
                            product.stock = to_decimal(product.stock) + (to_decimal(details.qty) * multiple)
                        else:
                            if (to_decimal(product.stock) - (to_decimal(details.qty)*multiple)) == 0:
                                product.cost_price = 0
                            else:
                                product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))-(to_decimal(details.price)*to_decimal(details.qty)))/(to_decimal(product.stock) - (to_decimal(details.qty)*multiple))
                            product.stock = to_decimal(product.stock) - (to_decimal(details.qty) * multiple)
                        product.save()
                    purchase_details.delete()
                    jv = tblJournalVoucher_Master.objects.get(master_id = id, transaction_type = 'PR' if to_return else 'PU')
                    jv.delete()
                    cheque = tblCheques.objects.get(purchase = purchase)
                    cheque.delete()
                else:
                    purchase = tblPurchase_Master.objects.create(
                        invoice_no = master_data['invoice_no'],
                        return_no = master_data['return_no'] if to_return else '',
                        purchase_no = master_data['purchase_no'],
                        invoice_date = master_data['invoice_date'],
                        total = total,
                        vat = vat,
                        discount = discount,
                        net_amount = net_amount,
                        amount_payed = amount_payed,
                        balance = balance,
                        roundoff = roundoff,
                        payment_method = payment_method,
                        cheque_no = master_data['cheque_no'],
                        cheque_date = master_data['cheque_date'],
                        vendor = vendor,
                        salesman = salesman,
                        transaction_type = 'return' if to_return else 'purchase'
                    )
                    
                if (to_return):
                    vendor.credit_balance = to_decimal(vendor.credit_balance) - balance
                else:
                    vendor.credit_balance = to_decimal(vendor.credit_balance) + balance
                vendor.save()

                cost_price = 0
                for details in details_data:
                    product = tblProduct.objects.get(id=details['product'])
                    unit = details['unit']
                    qty = to_decimal(details['qty'])
                    price = to_decimal(details['price'])
                    vat_perc = to_decimal(details['vat_perc'])
                    item_vat = to_decimal(details['item_vat'])
                    item_discount = to_decimal(details['item_discount'])
                    item_total = to_decimal(details['item_total'])

                    tblPurchase_Details.objects.create(
                        purchase = purchase,
                        product = product,
                        product_name = details['product_name'],
                        unit = unit,
                        qty = qty,
                        price = price,
                        vat_perc = vat_perc,
                        item_vat = item_vat,
                        item_discount = item_discount,
                        item_total = item_total,
                        previous_purchase_price = product.last_purchase_price
                    )
                    
                    if product.main_unit == unit:
                        multiple = 1
                    else:
                        prod_unit = tblProduct_unit.objects.get(product = product, unit = unit)
                        if prod_unit.multiple == '*':
                            multiple = 1/to_decimal(prod_unit.multiple_value)
                        else:
                            multiple = to_decimal(prod_unit.multiple_value)
                            
                    if (to_return):
                        if (to_decimal(product.stock) - (qty * multiple)) == 0:
                            product.cost_price = 0
                        else:
                            product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))-(price * qty))/(to_decimal(product.stock) - (qty * multiple))
                        product.stock = to_decimal(product.stock) - (qty * multiple)
                    else:
                        product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))+(price * qty))/(to_decimal(product.stock) + (qty * multiple))
                        product.stock = to_decimal(product.stock) + (qty * multiple)
                        product.last_purchase_price = price / multiple
                    product.save()
                    cost_price += qty * product.cost_price
                
                if to_return and (balance > 0 or payment_method == 'cheque'):
                    accounts_payables = tblAccountsPayables.objects.get(invoice=tblPurchase_Master.objects.get(invoice_no = master_data['invoice_no'], transaction_type = 'purchase'))
                    accounts_payables.amount = accounts_payables.amount - balance
                    accounts_payables.balance = accounts_payables.balance - balance
                    accounts_payables.save()
                elif balance > 0 or payment_method == 'Cheque':
                    tblAccountsPayables.objects.create(
                        vendor=vendor,
                        invoice=purchase,
                        due_date=datetime.strptime(master_data['invoice_date'], "%Y-%m-%d") + timedelta(days=to_integer(vendor.credit_days)),
                        amount = balance,
                        balance = balance
                    )
        
                journalVoucher = tblJournalVoucher_Master.objects.create(
                    jv_no = to_integer(tblJournalVoucher_Master.objects.aggregate(max_jv_no = Max('jv_no'))['max_jv_no']) + 1,
                    jv_date = master_data['invoice_date'],
                    debit = net_amount,
                    credit = net_amount,
                    transaction_type = 'PR' if to_return else 'PU',
                    master_id = purchase.id
                )

                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = 50002 if to_return else 50001),
                    name = '',
                    debit = 0 if to_return else net_amount,
                    credit = net_amount if to_return else 0,
                    amount = -1 * net_amount if to_return else net_amount
                )

                if amount_payed > 0:    
                    if payment_method == 'Cash': 
                        account_code = 10001
                    elif payment_method == 'Bank Transfer':
                        account_code = 10101
                    elif payment_method == 'Cheque':
                        account_code = 180001 if to_return else 280001
                        tblCheques.objects.create(
                            cheque_no = master_data['cheque_no'],
                            cheque_date = master_data['cheque_date'],
                            is_issued = True if to_return else False,
                            sales = sales,
                            transaction_type = 'PU'
                        )
                    else:
                        account_code = 10102

                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = account_code),
                        name = '',
                        debit = amount_payed if to_return else 0,
                        credit = 0 if to_return else amount_payed,
                        amount = amount_payed if to_return else -1 * amount_payed
                    )

                if balance > 0:
                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = 21001),
                        name = vendor.id,
                        debit = balance if to_return else 0,
                        credit = 0 if to_return else balance,
                        amount = balance if to_return else -1 * balance
                    )

                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = 150001),
                    name = '',
                    debit = 0 if to_return else net_amount,
                    credit = net_amount if to_return else 0,
                    amount = -1 * net_amount if to_return else net_amount
                )

                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = 50000),
                    name = '',
                    debit = 0 if to_return else cost_price,
                    credit = cost_price if to_return else 0,
                    amount = -1 * cost_price if to_return else cost_price
                )


                return JsonResponse({'id': purchase.id, "status": "success", "message": "Successfully saved the Invoice"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Invoice'})

    elif request.method == 'DELETE':    
        try:
            with transaction.atomic():
                purchase = tblPurchase_Master.objects.get(id=id)
                if purchase.transaction_type == 'return':
                    accounts_payables = tblAccountsPayables.objects.get(invoice = tblPurchase_Master.objects.get(invoice_no = purchase.invoice_no, transaction_type = 'purchase'))
                    if accounts_payables:
                        # if accounts_payables.balance < accounts_payables.amount:
                        #     return JsonResponse({"status": "failed", 'message': 'The Invoice Associated with this is fully/partially settled'})
                        accounts_payables.balance = accounts_payables.balance + purchase.balance
                        accounts_payables.amount = accounts_payables.amount + purchase.balance
                else:
                    accounts_payables = tblAccountsPayables.objects.get(invoice = purchase)
                    if accounts_payables:
                        if accounts_payables.balance < accounts_payables.amount:
                            return JsonResponse({"status": "failed", 'message': 'This Invoice is fully/partially settled'})

                vendor = tblVendor.objects.get(id = purchase.vendor.id)
                if purchase.transaction_type == 'return':
                    vendor.credit_balance = to_decimal(vendor.credit_balance) + to_decimal(purchase.balance)
                else:
                    vendor.credit_balance = to_decimal(vendor.credit_balance) - to_decimal(purchase.balance)
                vendor.save()
                tbl_detail = tblPurchase_Details.objects.filter(purchase = purchase.id)
                for details in tbl_detail:
                    product = tblProduct.objects.get(id = details.product.id)
                    
                    if product.main_unit == details.unit:
                        multiple = 1
                    else:
                        prod_unit = tblProduct_unit.objects.get(product = product, unit = details.unit)
                        if prod_unit.multiple == '*':
                            multiple = 1/to_decimal(prod_unit.multiple_value)
                        else:
                            multiple = to_decimal(prod_unit.multiple_value)
                    if purchase.transaction_type == 'return':
                        product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))+(to_decimal(details.price)*to_decimal(details.qty)))/(to_decimal(product.stock) + (to_decimal(details.qty)*multiple))
                        product.stock = to_decimal(product.stock) + (to_decimal(details.qty) * multiple)
                    else:
                        if (to_decimal(product.stock) - (to_decimal(details.qty)*multiple)) == 0:
                            product.cost_price = 0
                        else:
                            product.cost_price = ((to_decimal(product.cost_price)*to_decimal(product.stock))-(to_decimal(details.price)*to_decimal(details.qty)))/(to_decimal(product.stock) - (to_decimal(details.qty)*multiple))
                        product.stock = to_decimal(product.stock) - (to_decimal(details.qty) * multiple)
                        product.last_purchase_price = to_decimal(details.previous_purchase_price)
                    product.save()
                jv = tblJournalVoucher_Master.objects.get(master_id = id, transaction_type = 'PR' if to_return else 'PU')
                jv.delete()
                purchase.delete()
                return JsonResponse({"status": "success", "message": "Successfully deleted the Invoice"})
        except Exception as e:
            print(e)
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", "message": "Failed to delete the Invoice"})

    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})

@csrf_exempt
@transaction.atomic
def sales_order(request, id=None):
    if request.method == 'GET':
        sales_order = get_object_or_404(tblSalesOrder_Master, id=id) if id else tblSalesOrder_Master.objects.last()
        
        if sales_order is None:
            return JsonResponse({})
        
        sales_order_serializer = SalesOrderSerializer(sales_order)

        sales_order_details = tblSalesOrder_Details.objects.filter(sales_order=sales_order.id)
        sales_orderDetails_serializer = SalesOrderDetailsSerializer(sales_order_details, many=True)
        
        # Create an instance of idExists class
        id_checker = idExists(tblSalesOrder_Master, sales_order.id, 'sales_order')

        next_no = to_integer(tblSalesOrder_Master.objects.aggregate(max_order_no = Max('order_no'))['max_order_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': sales_order_serializer.data,
            'details_data': sales_orderDetails_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                # Extract fieldValues and data from the dictionary
                master_data = data['master_data']
                details_data = data['details_data']
                # print(product_data, unit_data)

                total = to_decimal(master_data['total']) if 'total' in master_data else 0
                vat = to_decimal(master_data['vat']) if 'vat' in master_data else 0
                discount = to_decimal(master_data['discount']) if 'discount' in master_data else 0
                roundoff = to_decimal(master_data['roundoff']) if 'roundoff' in master_data else 0
                net_amount = to_decimal(master_data['net_amount']) if 'net_amount' in master_data else 0
                customer = to_integer(master_data['customer']) if 'customer' in master_data else 0
                salesman = to_integer(master_data['salesman']) if 'salesman' in master_data else 0            

                if id:
                    sales_order = tblSalesOrder_Master.objects.get(id=id)
                    sales_order.order_no = master_data['order_no']
                    sales_order.order_date = master_data['order_date']
                    sales_order.total = total
                    sales_order.vat = vat
                    sales_order.discount = discount
                    sales_order.roundoff = roundoff
                    sales_order.net_amount = net_amount
                    sales_order.customer = tblCustomer.objects.get(id = customer) if customer > 0 else None
                    sales_order.salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None
                    sales_order_details = tblSalesOrder_Details.objects.filter(sales_order = sales_order)
                    sales_order_details.delete()
                    sales_order.save()
                else:
                    sales_order = tblSalesOrder_Master.objects.create(
                        order_no = master_data['order_no'],
                        order_date = master_data['order_date'],
                        total = total,
                        vat = vat,
                        discount = discount,
                        roundoff = roundoff,
                        net_amount = net_amount,
                        customer = tblCustomer.objects.get(id = customer) if customer > 0 else None,
                        salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None,
                    )


                for details in details_data:
                    product = tblProduct.objects.get(id=details['product'])
                    unit = details['unit']
                    qty = to_decimal(details['qty'])
                    price = to_decimal(details['price'])
                    vat_perc = to_decimal(details['vat_perc'])
                    item_vat = to_decimal(details['item_vat'])
                    item_discount = to_decimal(details['item_discount'])
                    item_total = to_decimal(details['item_total'])
                    tblSalesOrder_Details.objects.create(
                        sales_order = sales_order,
                        product = product,
                        product_name = details['product_name'],
                        unit = unit,
                        qty = qty,
                        price = price,
                        vat_perc = vat_perc,
                        item_vat = item_vat,
                        item_discount = item_discount,
                        item_total = item_total,
                    )


                return JsonResponse({'id': sales_order.id, "status": "success", "message": "Successfully saved the Order"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Order'})
            
    elif request.method == 'DELETE':
        try:
            sales_order = tblSalesOrder_Master.objects.get(id=id)
            sales_order.delete()
            return JsonResponse({"status": "success", "message": "Successfully deleted the Order"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "success", "message": "Failed to delete the Order"})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})

@csrf_exempt
@transaction.atomic
def purchase_order(request, id=None):
    if request.method == 'GET':
        purchase_order = get_object_or_404(tblPurchaseOrder_Master, id=id) if id else tblPurchaseOrder_Master.objects.last()
        
        if purchase_order is None:
            return JsonResponse({})
        
        purchase_order_serializer = PurchaseOrderSerializer(purchase_order)

        purchase_order_details = tblPurchaseOrder_Details.objects.filter(purchase_order=purchase_order.id)
        purchase_orderDetails_serializer = PurchaseOrderDetailsSerializer(purchase_order_details, many=True)
        
        # Create an instance of idExists class
        id_checker = idExists(tblPurchaseOrder_Master, purchase_order.id, 'purchase_order')

        next_no = to_integer(tblPurchaseOrder_Master.objects.aggregate(max_order_no = Max('order_no'))['max_order_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': purchase_order_serializer.data,
            'details_data': purchase_orderDetails_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                # Extract fieldValues and data from the dictionary
                master_data = data['master_data']
                details_data = data['details_data']
                # print(product_data, unit_data)

                total = to_decimal(master_data['total']) if 'total' in master_data else 0
                vat = to_decimal(master_data['vat']) if 'vat' in master_data else 0
                discount = to_decimal(master_data['discount']) if 'discount' in master_data else 0
                roundoff = to_decimal(master_data['roundoff']) if 'roundoff' in master_data else 0
                net_amount = to_decimal(master_data['net_amount']) if 'net_amount' in master_data else 0
                vendor = to_integer(master_data['vendor']) if 'vendor' in master_data else 0
                salesman = to_integer(master_data['salesman']) if 'salesman' in master_data else 0

                if id:
                    purchase_order = tblPurchaseOrder_Master.objects.get(id=id)
                    purchase_order.order_no = master_data['order_no']
                    purchase_order.order_date = master_data['order_date']
                    purchase_order.total = total
                    purchase_order.vat = vat
                    purchase_order.discount = discount
                    purchase_order.roundoff = roundoff
                    purchase_order.net_amount = net_amount
                    purchase_order.vendor = tblVendor.objects.get(id = vendor) if vendor > 0 else None
                    purchase_order.salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None
                    purchase_order_details = tblPurchaseOrder_Details.objects.filter(purchase_order = purchase_order)
                    purchase_order_details.delete()
                    purchase_order.save()
                else:
                    purchase_order = tblPurchaseOrder_Master.objects.create(
                        order_no = master_data['order_no'],
                        order_date = master_data['order_date'],
                        total = total,
                        vat = vat,
                        discount = discount,
                        roundoff = roundoff,
                        net_amount = net_amount,
                        vendor = tblVendor.objects.get(id = vendor) if vendor > 0 else None,
                        salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None,
                    )


                for details in details_data:
                    product = tblProduct.objects.get(id=details['product'])
                    unit = details['unit']
                    qty = to_decimal(details['qty'])
                    price = to_decimal(details['price'])
                    vat_perc = to_decimal(details['vat_perc'])
                    item_vat = to_decimal(details['item_vat'])
                    item_discount = to_decimal(details['item_discount'])
                    item_total = to_decimal(details['item_total'])
                    tblPurchaseOrder_Details.objects.create(
                        purchase_order = purchase_order,
                        product = product,
                        product_name = details['product_name'],
                        unit = unit,
                        qty = qty,
                        price = price,
                        vat_perc = vat_perc,
                        item_vat = item_vat,
                        item_discount = item_discount,
                        item_total = item_total,
                    )


                return JsonResponse({'id': purchase_order.id, "status": "success", "message": "Successfully saved the Order"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Order'})
            
    elif request.method == 'DELETE':
        try:
            purchase_order = tblPurchaseOrder_Master.objects.get(id=id)
            purchase_order.delete()
            return JsonResponse({"status": "success", "message": 'Successfully deleted the Order'})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "success", "message": "Failed to delete the Order"})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})

@csrf_exempt
@transaction.atomic
def quotation(request, id=None):
    if request.method == 'GET':
        quotation = get_object_or_404(tblQuotation_Master, id=id) if id else tblQuotation_Master.objects.last()
        
        if quotation is None:
            return JsonResponse({})
        
        quotation_serializer = QuotationSerializer(quotation)

        quotation_details = tblQuotation_Details.objects.filter(quotation=quotation.id)
        quotationDetails_serializer = QuotationDetailsSerializer(quotation_details, many=True)
        
        # Create an instance of idExists class
        id_checker = idExists(tblQuotation_Master, quotation.id, 'quotation')

        next_no = to_integer(tblQuotation_Master.objects.aggregate(max_quotation_no = Max('quotation_no'))['max_quotation_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': quotation_serializer.data,
            'details_data': quotationDetails_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                # Extract fieldValues and data from the dictionary
                master_data = data['master_data']
                details_data = data['details_data']
                # print(master_data, details_data)

                valid_till = master_data['valid_till'] if 'valid_till' in master_data else None
                total = to_decimal(master_data['total']) if 'total' in master_data else 0
                vat = to_decimal(master_data['vat']) if 'vat' in master_data else 0
                discount = to_decimal(master_data['discount']) if 'discount' in master_data else 0
                roundoff = to_decimal(master_data['roundoff']) if 'roundoff' in master_data else 0
                net_amount = to_decimal(master_data['net_amount']) if 'net_amount' in master_data else 0
                customer = to_integer(master_data['customer']) if 'customer' in master_data else 0
                salesman = to_integer(master_data['salesman']) if 'salesman' in master_data else 0
                
                if id:
                    quotation = tblQuotation_Master.objects.get(id=id)
                    quotation.quotation_no = master_data['quotation_no']
                    quotation.quotation_date = master_data['quotation_date']
                    quotation.valid_till = valid_till
                    quotation.total = total
                    quotation.vat = vat
                    quotation.discount = discount
                    quotation.roundoff = roundoff
                    quotation.net_amount = net_amount
                    quotation.customer = tblCustomer.objects.get(id = customer) if customer > 0 else None
                    quotation.salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None
                    quotation_details = tblQuotation_Details.objects.filter(quotation = quotation)
                    quotation_details.delete()
                    quotation.save()
                else:
                    quotation = tblQuotation_Master.objects.create(
                        quotation_no = master_data['quotation_no'],
                        quotation_date = master_data['quotation_date'],
                        valid_till = valid_till,
                        total = total,
                        vat = vat,
                        discount = discount,
                        roundoff = roundoff,
                        net_amount = net_amount,
                        customer = tblCustomer.objects.get(id = customer) if customer > 0 else None,
                        salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None,
                    )


                for details in details_data:
                    product = tblProduct.objects.get(id=details['product'])
                    unit = details['unit']
                    qty = to_decimal(details['qty'])
                    price = to_decimal(details['price'])
                    vat_perc = to_decimal(details['vat_perc'])
                    item_vat = to_decimal(details['item_vat'])
                    item_discount = to_decimal(details['item_discount'])
                    item_total = to_decimal(details['item_total'])
                    tblQuotation_Details.objects.create(
                        quotation = quotation,
                        product = product,
                        product_name = details['product_name'],
                        unit = unit,
                        qty = qty,
                        price = price,
                        vat_perc = vat_perc,
                        item_vat = item_vat,
                        item_discount = item_discount,
                        item_total = item_total,
                    )


                return JsonResponse({'id': quotation.id, "status": "success", "message": "Successfully saved the Quotation"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Quotation'})
            
    elif request.method == 'DELETE':
        try:
            quotation = tblQuotation_Master.objects.get(id=id)
            quotation.delete()
            return JsonResponse({"status": "success", "message": "Successfully deleted the Quotation"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "success", "message": "Failed to delete the Quotation"})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})

@csrf_exempt
@transaction.atomic
def preforma(request, id=None):
    if request.method == 'GET':
        preforma = get_object_or_404(tblPreforma_Master, id=id) if id else tblPreforma_Master.objects.last()
        
        if preforma is None:
            return JsonResponse({})
        
        preforma_serializer = PreformaSerializer(preforma)

        preforma_details = tblPreforma_Details.objects.filter(preforma=id)
        preformaDetails_serializer = PreformaDetailsSerializer(preforma_details, many=True)
        
        # Create an instance of idExists class
        id_checker = idExists(tblPreforma_Master, preforma.id, 'preforma')

        next_no = to_integer(tblPreforma_Master.objects.aggregate(max_preforma_no = Max('preforma_no'))['max_preforma_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': preforma_serializer.data,
            'details_data': preformaDetails_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                # Extract fieldValues and data from the dictionary
                master_data = data['master_data']
                details_data = data['details_data']
                # print(product_data, unit_data)
                
                total = to_decimal(master_data['total']) if 'total' in master_data else 0
                vat = to_decimal(master_data['vat']) if 'vat' in master_data else 0
                discount = to_decimal(master_data['discount']) if 'discount' in master_data else 0
                roundoff = to_decimal(master_data['roundoff']) if 'roundoff' in master_data else 0
                net_amount = to_decimal(master_data['net_amount']) if 'net_amount' in master_data else 0
                customer = to_integer(master_data['customer']) if 'customer' in master_data else 0
                salesman = to_integer(master_data['salesman']) if 'salesman' in master_data else 0

                if id:
                    preforma = tblPreforma_Master.objects.get(id=id)
                    preforma.preforma_no = master_data['preforma_no']
                    preforma.preforma_date = master_data['preforma_date']
                    preforma.total = total
                    preforma.vat = vat
                    preforma.discount = discount
                    preforma.roundoff = roundoff
                    preforma.net_amount = net_amount
                    preforma.customer = tblCustomer.objects.get(id = customer) if customer > 0 else None
                    preforma.salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None
                    preforma_details = tblPreforma_Details.objects.filter(preforma = preforma)
                    preforma_details.delete()
                    preforma.save()
                else:
                    preforma = tblPreforma_Master.objects.create(
                        preforma_no = master_data['preforma_no'],
                        preforma_date = master_data['preforma_date'],
                        total = total,
                        vat = vat,
                        discount = discount,
                        roundoff = roundoff,
                        net_amount = net_amount,
                        customer = tblCustomer.objects.get(id = customer) if customer > 0 else None,
                        salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None,
                    )


                for details in details_data:
                    product = tblProduct.objects.get(id=details['product'])
                    unit = details['unit']
                    qty = to_decimal(details['qty'])
                    price = to_decimal(details['price'])
                    vat_perc = to_decimal(details['vat_perc'])
                    item_vat = to_decimal(details['item_vat'])
                    item_discount = to_decimal(details['item_discount'])
                    item_total = to_decimal(details['item_total'])
                    tblPreforma_Details.objects.create(
                        preforma = preforma,
                        product = product,
                        unit = unit,
                        qty = qty,
                        price = price,
                        vat_perc = vat_perc,
                        item_vat = item_vat,
                        item_discount = item_discount,
                        item_total = item_total,
                    )


                return JsonResponse({'id': preforma.id, "status": "success", "message": "Successfully saved the Preforma"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Faield to save the Preforma'})
            
    elif request.method == 'DELETE':
        try:
            preforma = tblPreforma_Master.objects.get(id=id)
            preforma.delete()
            return JsonResponse({"status": "success", 'message': 'Successfully deleted the Preforma'})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", "message": "Failed to delete the Preforma"})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})

@csrf_exempt
@transaction.atomic
def rfq(request, id=None):
    if request.method == 'GET':
        rfq = get_object_or_404(tblRFQ_Master, id=id) if id else tblRFQ_Master.objects.last()

        if rfq is None:
            return JsonResponse({})

        rfq_serializer = RFQSerializer(rfq)

        rfq_details = tblRFQ_Details.objects.filter(rfq=rfq.id)
        rfqDetails_serializer = RFQDetailsSerializer(rfq_details, many=True)
        
        # Create an instance of idExists class
        id_checker = idExists(tblRFQ_Master, rfq.id, 'rfq')

        next_no = to_integer(tblRFQ_Master.objects.aggregate(max_rfq_no = Max('rfq_no'))['max_rfq_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': rfq_serializer.data,
            'details_data': rfqDetails_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                # Extract fieldValues and data from the dictionary
                master_data = data['master_data']
                details_data = data['details_data']
                # print(product_data, unit_data)
                
                vendor = to_integer(master_data['vendor']) if 'vendor' in master_data else 0
                salesman = to_integer(master_data['salesman']) if 'salesman' in master_data else 0
                if id:
                    rfq = tblRFQ_Master.objects.get(id=id)
                    rfq.rfq_no = master_data['rfq_no']
                    rfq.rfq_date = master_data['rfq_date']
                    rfq.vendor = tblVendor.objects.get(id = vendor) if vendor > 0 else None
                    rfq.salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None
                    rfq_details = tblRFQ_Details.objects.filter(rfq = rfq)
                    rfq_details.delete()
                    rfq.save()
                else:
                    rfq = tblRFQ_Master.objects.create(
                        rfq_no = master_data['rfq_no'],
                        rfq_date = master_data['rfq_date'],
                        vendor = tblVendor.objects.get(id = vendor) if vendor > 0 else None,
                        salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None,
                    )


                for details in details_data:
                    product = tblProduct.objects.get(id=details['product'])
                    unit = details['unit']
                    qty = to_decimal(details['qty'])
                    tblRFQ_Details.objects.create(
                        rfq = rfq,
                        product = product,
                        product_name = details['product_name'],
                        unit = unit,
                        qty = qty,
                    )


                return JsonResponse({'id': rfq.id, "status": "success", "message": "Successfully saved the RFQ"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the RFQ'})
            
    elif request.method == 'DELETE':
        try:
            rfq = tblRFQ_Master.objects.get(id=id)
            rfq.delete()
            return JsonResponse({"status": "success", "message": 'Successfully deleted the RFQ'})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to delete the RFQ'})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})

@csrf_exempt
@transaction.atomic
def delivery_note(request, id=None):
    if request.method == 'GET':
        delivery_note = get_object_or_404(tblDeliveryNote_Master, id=id) if id else tblDeliveryNote_Master.objects.last()
        
        if delivery_note is None:
            return JsonResponse({})
        
        delivery_note_serializer = DeliveryNoteSerializer(delivery_note)

        delivery_note_details = tblDeliveryNote_Details.objects.filter(delivery_note=delivery_note.id)
        delivery_noteDetails_serializer = DeliveryNoteDetailsSerializer(delivery_note_details, many=True)
        
        # Create an instance of idExists class
        id_checker = idExists(tblDeliveryNote_Master, delivery_note.id, 'delivery_note')

        next_no = to_integer(tblDeliveryNote_Master.objects.aggregate(max_delivery_note_no = Max('delivery_note_no'))['max_delivery_note_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': delivery_note_serializer.data,
            'details_data': delivery_noteDetails_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                # Extract fieldValues and data from the dictionary
                master_data = data['master_data']
                details_data = data['details_data']
                
                total = to_decimal(master_data['total']) if 'total' in master_data else 0
                vat = to_decimal(master_data['vat']) if 'vat' in master_data else 0
                discount = to_decimal(master_data['discount']) if 'discount' in master_data else 0
                roundoff = to_decimal(master_data['roundoff']) if 'roundoff' in master_data else 0
                net_amount = to_decimal(master_data['net_amount']) if 'net_amount' in master_data else 0
                customer = to_integer(master_data['customer']) if 'customer' in master_data else 0
                salesman = to_integer(master_data['salesman']) if 'salesman' in master_data else 0
                
                if id:
                    delivery_note = tblDeliveryNote_Master.objects.get(id=id)
                    delivery_note.delivery_note_no = master_data['delivery_note_no']
                    delivery_note.delivery_note_date = master_data['delivery_note_date']
                    delivery_note.total = total
                    delivery_note.vat = vat
                    delivery_note.discount = discount
                    delivery_note.roundoff = roundoff
                    delivery_note.net_amount = net_amount
                    delivery_note.customer = tblCustomer.objects.get(id = customer) if customer > 0 else None
                    delivery_note.salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None
                    delivery_note_details = tblDeliveryNote_Details.objects.filter(delivery_note = delivery_note)
                    delivery_note_details.delete()
                    delivery_note.save()
                else:
                    delivery_note = tblDeliveryNote_Master.objects.create(
                        delivery_note_no = master_data['delivery_note_no'],
                        delivery_note_date = master_data['delivery_note_date'],
                        total = total,
                        vat = vat,
                        discount = discount,
                        roundoff = roundoff,
                        net_amount = net_amount,
                        customer = tblCustomer.objects.get(id = customer) if customer > 0 else None,
                        salesman = tblEmployee.objects.get(id = salesman) if salesman > 0 else None,
                    )


                for details in details_data:
                    product = tblProduct.objects.get(id=details['product'])
                    unit = details['unit']
                    qty = to_decimal(details['qty'])
                    price = to_decimal(details['price'])
                    vat_perc = to_decimal(details['vat_perc'])
                    item_vat = to_decimal(details['item_vat'])
                    item_discount = to_decimal(details['item_discount'])
                    item_total = to_decimal(details['item_total'])
                    tblDeliveryNote_Details.objects.create(
                        delivery_note = delivery_note,
                        product = product,
                        product_name = details['product_name'],
                        unit = unit,
                        qty = qty,
                        price = price,
                        vat_perc = vat_perc,
                        item_vat = item_vat,
                        item_discount = item_discount,
                        item_total = item_total,
                    )


                return JsonResponse({'id': delivery_note.id, "status": "success", "message": "Successfully saved the Delivery Note"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Delivery Note'})
            
    elif request.method == 'DELETE':
        try:
            delivery_note = tblDeliveryNote_Master.objects.get(id=id)
            delivery_note.delete()
            return JsonResponse({"status": "success", "message": "Successfully deleted the Delivery Note"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", "message": "Failed to delete the Delivery Note"})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})

@csrf_exempt
@transaction.atomic
def journal_voucher(request, id=None):
    if request.method == 'GET':
        jv = get_object_or_404(tblJournalVoucher_Master, id=id) if id else tblJournalVoucher_Master.objects.last()

        if jv is None:
            return JsonResponse({})

        jv_serializer = JournalVoucherSerializer(jv)

        jv_details = tblJournalVoucher_Details.objects.filter(jv=jv.id, transaction_type='JV')
        jvDetails_serializer = JournalVoucherDetailsSerializer(jv_details, many=True)
        
        # Create an instance of idExists class
        id_checker = idExists(tblJournalVoucher_Master, jv.id, 'jv')

        next_no = to_integer(tblJournalVoucher_Master.objects.aggregate(max_jv_no = Max('jv_no'))['max_jv_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': jv_serializer.data,
            'details_data': jvDetails_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))
                # Extract fieldValues and data from the dictionary
                master_data = data['master_data']
                details_data = data['details_data']
                # print(master_data, details_data)
                debit = to_decimal(master_data['debit'])
                credit = to_decimal(master_data['credit'])
                if id:
                    journalVoucher = tblJournalVoucher_Master.objects.get(id=id)
                    journalVoucher.jv_no = master_data['jv_no']
                    journalVoucher.jv_date = master_data['jv_date']
                    journalVoucher.debit = debit
                    journalVoucher.credit = credit
                    journalVoucher.save()
                    journalVoucher_details = tblJournalVoucher_Details.objects.filter(jv = id)
                    journalVoucher_details.delete()
                else:
                    journalVoucher = tblJournalVoucher_Master.objects.create(
                        jv_no = master_data['jv_no'],
                        jv_date = master_data['jv_date'],
                        debit = debit,
                        credit = credit,
                    )

                for details in details_data:
                    account = tblChartOfAccounts.objects.get(id = details['account'])
                    name = details['name']
                    debit = to_decimal(details['debit'])
                    credit = to_decimal(details['credit'])
                    amount = debit if debit > 0 else -1 * credit
                    
                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = account,
                        name = name,
                        debit = debit,
                        credit = credit,
                        amount = amount
                    )


                return JsonResponse({'id': journalVoucher.id, "status": "success", "message": "Successfully saved the Journal"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Journal'})
            
    elif request.method == 'DELETE':
        try:
            jv = tblJournalVoucher_Master.objects.get(id=id)
            jv.delete()
            return JsonResponse({"status": "success", "message": "Successfully Deleted the Journal"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to delete the Journal'})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})
    
    
@csrf_exempt
@transaction.atomic
def payment(request, id = 0):
    if request.method == 'GET':
        payment = get_object_or_404(tblPayment, id=id) if id else tblPayment.objects.last()

        if payment is None:
            return JsonResponse({})

        payment_serializer = PaymentSerializer(payment)
        
        # Create an instance of idExists class
        id_checker = idExists(tblPayment, payment.id, 'payment')

        next_no = to_integer(tblPayment.objects.aggregate(max_payment_no = Max('payment_no'))['max_payment_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'data': payment_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                data = json.loads(request.body.decode('utf-8'))
                is_vendor = data['is_vendor'] if 'is_vendor' in data else False
                vendor = tblVendor.objects.get(id = data['vendor']) if 'vendor' in data and is_vendor else None
                amount = to_decimal(data['amount']) if 'amount' in data else 0
                discount = to_decimal(data['discount']) if 'discount' in data and is_vendor else 0
                payment_method = data['payment_method'] if 'payment_method' in data else 'Cash'
                cheque_no = data['cheque_no'] if 'cheque_no' in data else None
                cheque_date = data['cheque_date'] if 'cheque_date' in data else None
                
                if id:
                    payment = tblPayment.objects.get(id=id)
                    vendor.credit_balance = to_decimal(vendor.credit_balance) + to_decimal(payment.amount) + to_decimal(payment.discount)
                    payables = tblAccountsPayables.objects.filter(vendor=vendor, balance__lt=F('amount')).order_by('-due_date')
                    total = payment.amount + payment.discount
                    for payable in payables:
                        if total == 0 or (payment.payment_method == 'Cheque' and not tblChequeTransfer.objects.get(cheque__payment = payment)):
                            break
                        elif total == payable.amount:
                            payable.balance = payable.amount
                            payable.save()
                            break
                        elif total > payable.amount:
                            payable.balance = payable.amount
                            total -= payable.balance
                            payable.save()
                        else:
                            payable.balance += total
                            payable.save()
                            break
                    payment.payment_no = data['payment_no']
                    payment.payment_date = data['payment_date']
                    payment.vendor = vendor
                    payment.amount = amount
                    payment.discount = discount
                    payment.payment_method = payment_method
                    payment.cheque_no = cheque_no
                    payment.cheque_date = cheque_date
                    payment.save()
                    jv = tblJournalVoucher_Master.objects.get(transaction_type = 'PA', master_id=id)
                    jv.delete()
                    cheque = tblCheques.objects.get(payment = payment)
                    cheque.delete()
                else:
                    payment = tblPayment.objects.create(
                        payment_no = data['payment_no'],
                        payment_date = data['payment_date'],
                        vendor = vendor,
                        amount = amount,
                        discount = discount,
                        payment_method = payment_method,
                        cheque_no = cheque_no,
                        cheque_date = cheque_date,
                    )
                
                vendor.credit_balance = to_decimal(vendor.credit_balance) - amount - discount
                vendor.save()
                    
                

                journalVoucher = tblJournalVoucher_Master.objects.create(
                    jv_no = to_integer(tblJournalVoucher_Master.objects.aggregate(max_jv_no = Max('jv_no'))['max_jv_no']) + 1,
                    jv_date = data['payment_date'],
                    debit = amount,
                    credit = amount,
                    transaction_type = 'PA',
                    master_id = payment.id
                )
                    
                if vendor:
                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = 21001),
                        name = vendor.id,
                        debit = (amount + discount),
                        credit = 0,
                        amount = (amount + discount)
                    )

                    payables = tblAccountsPayables.objects.filter(vendor=vendor, balance__gt=0)
                    total = amount + discount
                    for payable in payables:
                        if total == 0 or payment_method == 'Cheque':
                            break
                        elif total == payable.balance:
                            payable.balance = 0
                            payable.save()
                            break
                        elif total > payable.balance:
                            total -= payable.balance
                            payable.balance = 0
                            payable.save()
                        else:
                            payable.balance -= total
                            payable.save()
                            break
                
                if amount > 0:
                    if payment_method == 'Cash': 
                        account_code = 10001
                    elif payment_method == 'Bank Transfer':
                        account_code = 10101
                    elif payment_method == 'Cheque':
                        account_code = 280001
                        tblCheques.objects.create(
                            cheque_no = cheque_no,
                            cheque_date = cheque_date,
                            is_issued = True,
                            payment = payment,
                            transaction_type = 'PA'
                        )
                    else:
                        account_code = 10102

                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = account_code),
                        name = '',
                        debit = 0,
                        credit = amount,
                        amount = -1 * amount
                    )

                if discount > 0:
                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = 40010),
                        name = '',
                        debit = 0,
                        credit = discount,
                        amount = -1 * discount
                    )


                return JsonResponse({"id": payment.id, "status": "success", "message": "Successfully saved the payment"}, safe=False)
        except Exception as e:
            print(f"An exception occurred: {str(e)}")
            return JsonResponse({"status": "failed", "message": "Failed to save the Payment"}, safe=False)
    
    elif request.method == 'DELETE':
        try:
            with transaction.atomic():
                payment = tblPayment.objects.get(id=id)
                vendor = tblVendor.objects.get(id = payment.vendor.id)
                vendor.credit_balance = to_decimal(vendor.credit_balance) + to_decimal(payment.discount) + to_decimal(payment.amount)
                vendor.save()
                payables = tblAccountsPayables.objects.filter(vendor=vendor, balance__lt=F('amount')).order_by('-due_date')
                total = payment.amount + payment.discount
                for payable in payables:
                    if total == 0 or (payment.payment_method == 'Cheque' and not tblChequeTransfer.objects.get(cheque__payment = payment)):
                        break
                    elif total == payable.amount:
                        payable.balance = payable.amount
                        payable.save()
                        break
                    elif total > payable.amount:
                        payable.balance = payable.amount
                        total -= payable.balance
                        payable.save()
                    else:
                        payable.balance += total
                        payable.save()
                        break
                jv = tblJournalVoucher_Master.objects.get(transaction_type = 'PA', master_id=id)
                jv.delete()
                payment.delete()
                return JsonResponse({"status": "success", "message": "Successfully deleted the payment"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", "message": "Failed to delete the payment"})
    
@csrf_exempt
@transaction.atomic
def receipt(request, id = 0):
    if request.method == 'GET':
        receipt = get_object_or_404(tblReceipt, id=id) if id else tblReceipt.objects.last()

        if receipt is None:
            return JsonResponse({})
        
        receipt_serializer = ReceiptSerializer(receipt)
        
        # Create an instance of idExists class
        id_checker = idExists(tblReceipt, receipt.id, 'receipt')

        next_no = to_integer(tblReceipt.objects.aggregate(max_receipt_no = Max('receipt_no'))['max_receipt_no']) + 1
        
        # Include the idExists results in the response data
        response_data = {
            'data': receipt_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no,
            }
        }

        return JsonResponse(response_data, safe=False)
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                data = json.loads(request.body.decode('utf-8'))
                is_customer = data['is_customer'] if 'is_customer' in data else False
                customer = tblCustomer.objects.get(id = data['customer']) if 'customer' in data and is_customer else None
                amount = to_decimal(data['amount']) if 'amount' in data else 0
                discount =to_decimal(data['discount']) if 'discount' in data and is_customer else 0
                payment_method = data['payment_method'] if 'payment_method' in data else 'Cash'
                cheque_no = data['cheque_no'] if 'cheque_no' in data else None
                cheque_date = data['cheque_date'] if 'cheque_date' in data else None
                
                if id:
                    receipt = tblReceipt.objects.get(id=id)
                    customer.credit_balance = to_decimal(customer.credit_balance) + to_decimal(receipt.amount) + to_decimal(receipt.discount)
                    receivables = tblAccountsReceivables.objects.filter(customer=customer, balance__lt=F('amount')).order_by('-due_date')
                    total = receipt.amount + receipt.discount
                    for receivable in receivables:
                        if total == 0 or (receipt.payment_method == 'Cheque' and not tblChequeTransfer.objects.get(cheque__receipt = receipt)):
                            break
                        elif total == receivable.amount:
                            receivable.balance = receivable.amount
                            receivable.save()
                            break
                        elif total > receivable.amount:
                            receivable.balance = receivable.amount
                            total -= receivable.balance
                            receivable.save()
                        else:
                            receivable.balance += total
                            receivable.save()
                            break
                    receipt.receipt_no = data['receipt_no']
                    receipt.receipt_date = data['receipt_date']
                    receipt.customer = customer
                    receipt.amount = amount
                    receipt.discount = discount
                    receipt.payment_method = payment_method
                    receipt.cheque_no = cheque_no
                    receipt.cheque_date = cheque_date
                    receipt.save()
                    jv = tblJournalVoucher_Master.objects.get(transaction_type = 'RE', master_id=id)
                    jv.delete()
                    cheque = tblCheques.objects.get(receipt = receipt)
                    cheque.delete()
                else:
                    receipt = tblReceipt.objects.create(
                        receipt_no = data['receipt_no'],
                        receipt_date = data['receipt_date'],
                        customer = customer,
                        amount = amount,
                        discount = discount,
                        payment_method = payment_method,
                        cheque_no = cheque_no,
                        cheque_date = cheque_date,
                    )

                customer.credit_balance = to_decimal(customer.credit_balance) - amount - discount
                customer.save()

                

                journalVoucher = tblJournalVoucher_Master.objects.create(
                    jv_no = to_integer(tblJournalVoucher_Master.objects.aggregate(max_jv_no = Max('jv_no'))['max_jv_no']) + 1,
                    jv_date = data['receipt_date'],
                    debit = amount,
                    credit = amount,
                    transaction_type = 'RE',
                    master_id = receipt.id
                )
                
                if amount > 0:
                    if payment_method == 'Cash': 
                        account_code = 10001
                    elif payment_method == 'Bank Transfer':
                        account_code = 10101
                    elif payment_method == 'Cheque':
                        account_code = 180001
                        tblCheques.objects.create(
                            cheque_no = cheque_no,
                            cheque_date = cheque_date,
                            is_issued = False,
                            receipt = receipt,
                            transaction_type = 'RE'
                        )
                    else:
                        account_code = 10102

                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = account_code),
                        name = '',
                        debit = amount,
                        credit = 0,
                        amount = amount
                    )

                if discount > 0:
                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = 50010),
                        name = '',
                        debit = discount,
                        credit = 0,
                        amount = discount
                    )
                    
                if customer:
                    tblJournalVoucher_Details.objects.create(
                        jv = journalVoucher,
                        account = tblChartOfAccounts.objects.get(account_code = 11001),
                        name = customer.id,
                        debit = 0,
                        credit = (amount + discount),
                        amount = -1 * (amount + discount)
                    )

                    receivables = tblAccountsReceivables.objects.filter(customer=customer, balance__gt=0).order_by('due_date')
                    total = amount + discount
                    for receivable in receivables:
                        if total == 0 or payment_method == 'Cheque':
                            break
                        elif total == receivable.balance:
                            receivable.balance = 0
                            receivable.save()
                            break
                        elif total > receivable.balance:
                            total -= receivable.balance
                            receivable.balance = 0
                            receivable.save()
                        else:
                            receivable.balance -= total
                            receivable.save()
                            break


                return JsonResponse({"id": receipt.id, "status": "success", 'message': 'Successfully Saved the Receipt'}, safe=False)
        except Exception as e:
            # print(f"An exception occurred: {str(e)}")
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Receipt'}, safe=False)
    
    elif request.method == 'DELETE':
        try:
            with transaction.atomic():
                receipt = tblReceipt.objects.get(id=id)
                customer = tblCustomer.objects.get(id = receipt.customer.id)
                customer.credit_balance = to_decimal(customer.credit_balance) + to_decimal(receipt.discount) + to_decimal(receipt.amount)
                customer.save()
                receivables = tblAccountsReceivables.objects.filter(customer=customer, balance__lt=F('amount')).order_by('-due_date').values()
                total = receipt.amount + receipt.discount
                for receivable in receivables:
                    if total == 0 or (receipt.payment_method == 'Cheque' and not tblChequeTransfer.objects.get(cheque__receipt = receipt)):
                        break
                    elif total == receivable.amount:
                        receivable.balance = receivable.amount
                        receivable.save()
                        break
                    elif total > receivable.amount:
                        receivable.balance = receivable.amount
                        total -= receivable.balance
                        receivable.save()
                    else:
                        receivable.balance += total
                        receivable.save()
                        break
                jv = tblJournalVoucher_Master.objects.get(transaction_type = 'RE', master_id=id)
                jv.delete()
                receipt.delete()
                return JsonResponse({"status": "success", "message": "Successfully deleted the Receipt"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", "message": "Failed to delete the Receipt"})
        

@csrf_exempt
@transaction.atomic
def petty_cash(request, id=None):
    if request.method == 'GET':
        petty_cash = get_object_or_404(tblPettyCash_Master, id=id) if id else tblPettyCash_Master.objects.last()

        if petty_cash is None:
            return JsonResponse({})

        petty_cash_serializer = PettyCashSerializer(petty_cash)

        petty_cash_details = tblPettyCash_Details.objects.filter(petty_cash=petty_cash.id)
        petty_cash_details_serializer = PettyCashDetailsSerializer(petty_cash_details, many=True)
        
        # Create an instance of idExists class
        id_checker = idExists(tblPettyCash_Master, petty_cash.id, 'petty_cash')

        next_no = to_integer(tblPettyCash_Master.objects.aggregate(max_transaction_no = Max('transaction_no'))['max_transaction_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'master_data': petty_cash_serializer.data,
            'details_data': petty_cash_details_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                # Extract fieldValues and data from the dictionary
                master_data = data['master_data']
                details_data = data['details_data']
                # print(product_data, unit_data)
                
                petty_cash_account = to_integer(master_data['petty_cash_account']) if 'petty_cash_account' in master_data else 0
                total = to_decimal(master_data['total'])
                if id:
                    petty_cash = tblPettyCash_Master.objects.get(id=id)
                    petty_cash.transaction_no = master_data['transaction_no']
                    petty_cash.transaction_date = master_data['transaction_date']
                    petty_cash.total = total
                    petty_cash.petty_cash_account = tblChartOfAccounts.objects.get(id = petty_cash_account) if petty_cash_account > 0 else None
                    petty_cash_details = tblPettyCash_Details.objects.filter(petty_cash = petty_cash)
                    petty_cash_details.delete()
                    petty_cash.save()
                    jv = tblJournalVoucher_Master.objects.get(transaction_type = 'PC', master_id=id)
                    jv.delete()
                else:
                    petty_cash = tblPettyCash_Master.objects.create(
                        transaction_no = master_data['transaction_no'],
                        transaction_date = master_data['transaction_date'],
                        total = total,
                        petty_cash_account = tblChartOfAccounts.objects.get(id = petty_cash_account) if petty_cash_account > 0 else None,
                    )


                for details in details_data:
                    account = tblChartOfAccounts.objects.get(id=details['account'])
                    amount = to_decimal(details['amount'])
                    remarks = details['remarks']
                    tblPettyCash_Details.objects.create(
                        petty_cash = petty_cash,
                        account = account,
                        amount = amount,
                        remarks = remarks,
                    )

                journalVoucher = tblJournalVoucher_Master.objects.create(
                    jv_no = to_integer(tblJournalVoucher_Master.objects.aggregate(max_jv_no = Max('jv_no'))['max_jv_no']) + 1,
                    jv_date = data['transaction_date'],
                    debit = total,
                    credit = total,
                    transaction_type = 'PC',
                    master_id = petty_cash.id
                )
                    
                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(id = petty_cash_account),
                    name = None,
                    debit = total,
                    credit = 0,
                    amount = total
                )

                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = 10002),
                    name = None,
                    debit = 0,
                    credit = total,
                    amount = -1 * total
                )


                return JsonResponse({'id': petty_cash.id, "status": "success", "message": "Successfully saved the Petty Cash"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Petty Cash'})
            
    elif request.method == 'DELETE':
        try:
            with transaction.atomic():
                petty_cash = tblPettyCash_Master.objects.get(id=id)
                petty_cash.delete()
                jv = tblJournalVoucher_Master.objects.get(transaction_type = 'PC', master_id=id)
                jv.delete()
                return JsonResponse({"status": "success", "message": 'Successfully deleted the Petty Cash'})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to delete the Petty Cash'})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})


@csrf_exempt
@transaction.atomic
def cheque_transfer(request, id = None):
    if request.method == 'GET':
        cheque_transfer = get_object_or_404(tblChequeTransfer, id=id) if id else tblChequeTransfer.objects.last()

        if cheque_transfer is None:
            return JsonResponse({})

        cheque_transfer_serializer = ChequeTransferSerializer(cheque_transfer)
        
        # Create an instance of idExists class
        id_checker = idExists(tblChequeTransfer, cheque_transfer.id, 'cheque_transfer')

        next_no = to_integer(tblChequeTransfer.objects.aggregate(max_transfer_no = Max('transfer_no'))['max_transfer_no']) + 1

        # Include the idExists results in the response data
        response_data = {
            'data': cheque_transfer_serializer.data,
            'id_exists': {
                'first_id': id_checker.getFirstID(),
                'next_id': id_checker.getNextID(),
                'prev_id': id_checker.getPrevID(),
                'last_id': id_checker.getLastID(),
                'next_no': next_no
            }
        }

        return JsonResponse(response_data, safe=False)
        
    
    elif request.method == 'POST':
        try:
            with transaction.atomic():
                # Get the data as a JSON string and parse it into a Python dictionary
                data = json.loads(request.body.decode('utf-8'))

                cheque = tblCheques.objects.get(id = data['cheque'])
                transfer_method = data['transfer_method']
                
                if id:
                    cheque_transfer = tblChequeTransfer.objects.get(id=id)
                    match cheque.transaction_type:
                        case 'PU':
                            amount = cheque.purchase.amount_payed
                            payable = tblAccountsPayables.objects.get(invoice = cheque.purchase)
                            if cheque.is_issued:
                                payable.balance = payable.balance + amount
                            else:
                                pass
                        case 'SA':
                            amount = cheque.sales.amount_received
                            receivable = tblAccountsReceivables.objects.get(invoice = cheque.sales)
                            if cheque.is_issued:
                                pass
                            else:
                                receivable.balance = receivable.balance + amount
                            receivable.save()
                        case 'PA':
                            amount = cheque.payment.amount
                            payables = tblAccountsPayables.objects.filter(vendor=payment.vendor, balance__lt=F('amount'))
                            for payable in payables:
                                if amount == 0:
                                    break
                                elif amount == payable.amount:
                                    payable.balance = amount
                                    payable.save()
                                    break
                                elif amount > payable.amount:
                                    amount -= payable.amount
                                    payable.balance = payable.amount
                                    payable.save()
                                else:
                                    payable.balance += amount
                                    payable.save()
                                    break
                        case 'RE':
                            amount = cheque.receipt.amount
                            receivables = tblAccountsReceivables.objects.filter(customer=receipt.customer, balance__lt=F('amount'))
                            for receivable in receivables:
                                if amount == 0:
                                    break
                                elif amount == receivable.amount:
                                    receivable.balance = amount
                                    receivable.save()
                                    break
                                elif amount > receivable.amount:
                                    amount -= receivable.amount
                                    receivable.balance = receivable.amount
                                    receivable.save()
                                else:
                                    receivable.balance += amount
                                    receivable.save()
                                    break
                    cheque_transfer.transfer_no = data['transfer_no']
                    cheque_transfer.transfer_date = data['transfer_date']
                    cheque_transfer.cheque = cheque
                    cheque_transfer.transfer_method =transfer_method
                    cheque_transfer.save()
                    jv = tblJournalVoucher_Master.objects.get(transaction_type = 'CT', master_id=id)
                    jv.delete()
                else:
                    cheque_transfer = tblChequeTransfer.objects.create(
                        transfer_no = data['transfer_no'],
                        transfer_date = data['transfer_date'],
                        cheque = cheque,
                        transfer_method = data['transfer_method']
                    )
                    
                match cheque.transaction_type:
                    case 'PU':
                        amount = cheque.purchase.amount_payed
                        payable = tblAccountsPayables.objects.get(invoice = cheque.purchase)
                        if cheque.is_issued:
                            payable.balance = payable.balance - amount
                        else:
                            pass
                    case 'SA':
                        amount = cheque.sales.amount_received
                        receivable = tblAccountsReceivables.objects.get(invoice = cheque.sales)
                        if cheque.is_issued:
                            pass
                        else:
                            receivable.balance = receivable.balance - amount
                        receivable.save()
                    case 'PA':
                        amount = cheque.payment.amount
                        payables = tblAccountsPayables.objects.filter(vendor=payment.vendor, balance__gt=0)
                        for payable in payables:
                            if amount == 0:
                                break
                            elif amount == payable.balance:
                                payable.balance = 0
                                payable.save()
                                break
                            elif amount > payable.balance:
                                amount -= payable.balance
                                payable.balance = 0
                                payable.save()
                            else:
                                payable.balance -= amount
                                payable.save()
                                break
                    case 'RE':
                        amount = cheque.receipt.amount
                        receivables = tblAccountsReceivables.objects.filter(customer=receipt.customer, balance__gt=0)
                        for receivable in receivables:
                            if amount == 0:
                                break
                            elif amount == receivable.balance:
                                receivable.balance = 0
                                receivable.save()
                                break
                            elif amount > receivable.balance:
                                amount -= receivable.balance
                                receivable.balance = 0
                                receivable.save()
                            else:
                                receivable.balance -= amount
                                receivable.save()
                                break


                journalVoucher = tblJournalVoucher_Master.objects.create(
                    jv_no = to_integer(tblJournalVoucher_Master.objects.aggregate(max_jv_no = Max('jv_no'))['max_jv_no']) + 1,
                    jv_date = data['transfer_date'],
                    debit = amount,
                    credit = amount,
                    transaction_type = 'CT',
                    master_id = cheque_transfer.id
                )
                    
                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = 280001 if cheque.is_issued else 180001),
                    name = None,
                    debit = amount if cheque.is_issued else 0,
                    credit = 0 if cheque.is_issued else amount,
                    amount = amount if cheque.is_issued else -1 * amount
                )

                if transfer_method == 'Cash': 
                    account_code = 10001
                elif transfer_method == 'Bank Transfer':
                    account_code = 10101
                else:
                    account_code = 10102

                tblJournalVoucher_Details.objects.create(
                    jv = journalVoucher,
                    account = tblChartOfAccounts.objects.get(account_code = account_code),
                    name = None,
                    debit = 0 if cheque.is_issued else amount,
                    credit = amount if cheque.is_issued else 0,
                    amount = -1 * amount if cheque.is_issued else 0
                )


                return JsonResponse({'id': cheque_transfer.id, "status": "success", "message": "Successfully saved the Cheque Transfer"})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to save the Cheque Transfer'})
            
    elif request.method == 'DELETE':
        try:
            with transaction.atomic:
                cheque_transfer = tblChequeTransfer.objects.get(id=id)
                cheque_transfer.delete()
                match cheque.transaction_type:
                    case 'PU':
                        amount = cheque.purchase.amount_payed
                        payable = tblAccountsPayables.objects.get(invoice = cheque.purchase)
                        if cheque.is_issued:
                            payable.balance = payable.balance + amount
                        else:
                            pass
                    case 'SA':
                        amount = cheque.sales.amount_received
                        receivable = tblAccountsReceivables.objects.get(invoice = cheque.sales)
                        if cheque.is_issued:
                            pass
                        else:
                            receivable.balance = receivable.balance + amount
                        receivable.save()
                    case 'PA':
                        amount = cheque.payment.amount
                        payables = tblAccountsPayables.objects.filter(vendor=payment.vendor, balance__lt=F('amount'))
                        for payable in payables:
                            if amount == 0:
                                break
                            elif amount == payable.amount:
                                payable.balance = amount
                                payable.save()
                                break
                            elif amount > payable.amount:
                                amount -= payable.amount
                                payable.balance = payable.amount
                                payable.save()
                            else:
                                payable.balance += amount
                                payable.save()
                                break
                    case 'RE':
                        amount = cheque.receipt.amount
                        receivables = tblAccountsReceivables.objects.filter(customer=receipt.customer, balance__lt=F('amount'))
                        for receivable in receivables:
                            if amount == 0:
                                break
                            elif amount == receivable.amount:
                                receivable.balance = amount
                                receivable.save()
                                break
                            elif amount > receivable.amount:
                                amount -= receivable.amount
                                receivable.balance = receivable.amount
                                receivable.save()
                            else:
                                receivable.balance += amount
                                receivable.save()
                                break
                jv = tblJournalVoucher_Master.objects.get(transaction_type = 'CT', master_id=id)
                jv.delete()
            return JsonResponse({"status": "success", "message": 'Successfully deleted the Cheque Transfer'})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to delete the Cheque Transfer'})
    else:
        return JsonResponse({"status": "failed", 'message': 'Invalid request method'})








@transaction.atomic
def clear_all(request):
    # cursor = connection.cursor()
    try:
        with transaction.atomic():
            tblSales_Master.objects.all().delete()
            tblPurchase_Master.objects.all().delete()
            tblPurchaseOrder_Master.objects.all().delete()
            tblSalesOrder_Master.objects.all().delete()
            tblDeliveryNote_Master.objects.all().delete()
            tblQuotation_Master.objects.all().delete()
            tblPreforma_Master.objects.all().delete()
            tblRFQ_Master.objects.all().delete()
            tblJournalVoucher_Master.objects.all().delete()
            tblPayment.objects.all().delete()
            tblReceipt.objects.all().delete()
            tblPettyCash_Master.objects.all().delete()
            tblProduct.objects.all().update(cost_price = 0, last_purchase_price = 0, stock = 0, stock_on_delivery = 0)
            tblCustomer.objects.all().update(credit_balance = 0)
            tblVendor.objects.all().update(credit_balance = 0)
            tblChartOfAccounts.objects.filter(locked = False).delete()
            tblChartOfAccounts.objects.all().update(opening_balance = 0)
            return JsonResponse({'status': 'success', 'message': 'All Details Cleared'})
    except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({'status': 'failed', 'message': 'Failed to Clear Details'})

def homeDetails(request):
    sales_order = tblSalesOrder_Master.objects.all().order_by('order_date')
    receivables = tblAccountsReceivables.objects.filter(balance__gt = 0).order_by('due_date')
    payables = tblAccountsPayables.objects.filter(balance__gt = 0).order_by('due_date')


    sales_order_serializer = SalesOrderSerializer(sales_order, many=True)
    receivables_serializer = AccountsReceivablesSerializer(receivables, many=True)
    payables_serializer = AccountsPayablesSerializer(payables, many=True)
    
    two_weeks = now() - timedelta(days=to_integer(14))

    # Query to get the sum of net_amount for each invoice_date in the last 10 days
    sales_change = tblSales_Master.objects.filter(
        transaction_type='sales',
        invoice_date__gte=two_weeks
    ).values('invoice_date').annotate(total_net_amount=Sum('net_amount')).order_by('invoice_date')

    response_data = {
        'orders': sales_order_serializer.data,
        'receivables': receivables_serializer.data,
        'payables': payables_serializer.data,
        'sales_change': list(sales_change)
    }

    return JsonResponse(data=response_data, safe=False)

def pdf_print(request, module, id):
    # Get your HTML template
    
    if module == 'purchase' or module == 'purchase_return':
        # Context data for rendering the template
        template = get_template('pdf_print/invoice.html')
        master = tblPurchase_Master.objects.get(id = id)
        details = tblPurchase_Details.objects.filter(purchase = master)
    elif module == 'sales' or module == 'sales_return':
        template = get_template('pdf_print/invoice.html')
        master = tblSales_Master.objects.get(id = id)
        details = tblSales_Details.objects.filter(sales = master)
    elif module == 'purchase_order':
        template = get_template('pdf_print/order.html')
        master = tblPurchaseOrder_Master.objects.get(id = id)
        details = tblPurchaseOrder_Details.objects.filter(purchase_order = master)
    elif module == 'sales_order':
        template = get_template('pdf_print/order.html')
        master = tblSalesOrder_Master.objects.get(id = id)
        details = tblSalesOrder_Details.objects.filter(sales_order = master)
    elif module == 'quotation':
        template = get_template('pdf_print/quotation.html')
        master = tblQuotation_Master.objects.get(id = id)
        details = tblQuotation_Details.objects.filter(quotation = master)
    elif module == 'delivery_note':
        template = get_template('pdf_print/delivery_note.html')
        master = tblDeliveryNote_Master.objects.get(id = id)
        details = tblDeliveryNote_Details.objects.filter(delivery_note = master)
    elif module == 'preforma':
        template = get_template('pdf_print/preforma.html')
        master = tblPreforma_Master.objects.get(id = id)
        details = tblPreforma_Details.objects.filter(preforma = master)
    elif module == 'rfq':
        template = get_template('pdf_print/rfq.html')
        master = tblRFQ_Master.objects.get(id = id)
        details = tblRFQ_Details.objects.filter(rfq = master)

    if module == 'rfq':
        context = {'module_name': module, 'master': master, 'details': details}
    else:
        total_amt = 0
        for detail in details:
            total_amt = total_amt + to_decimal(detail.item_total)
        total = str(master.net_amount).split('.')
        total_in_words = num2words(total[0]) + ' AED'
        if to_integer(total[1]) > 0:
            total_in_words = total_in_words + ' and ' + num2words(total[1]) + ' F'
        context = {'module_name': module, 'master': master, 'details': details, 'total_amt': total_amt, 'total_in_words': total_in_words.title()}
    
    # Render the template with the context data
    html_content = template.render(context)

    # Generate PDF using pdfkit
    pdf_file = pdfkit.from_string(html_content, False, configuration=pdfkit.configuration(wkhtmltopdf=settings.WKHTMLTOPDF_BIN_PATH))

    # Create an HTTP response with PDF content
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = 'inline; filename="output.pdf"'

    return response

def report(request, report_type):
    # Get your HTML template
    if report_type == 'sales':
        template = get_template('reports/sales_report.html')
        context = sales_report(request)
    
    if report_type == 'purchase':
        template = get_template('reports/purchase_report.html')
        context = purchase_report(request)

    elif report_type == 'jv':
        template = get_template('reports/jv_report.html')
        context = jv_report(request)

    elif report_type == 'trial_balance':
        template = get_template('reports/trial_balance.html')
        context = trial_balance(request)

    elif report_type == 'profit_loss':
        template = get_template('reports/profit_loss.html')
        context = profit_loss(request)

    elif report_type == 'balance_sheet':
        template = get_template('reports/balance_sheet.html')
        context = balance_sheet(request)
    
    # Render the template with the context data
    html_content = template.render(context)

    # Generate PDF using pdfkit
    pdf_file = pdfkit.from_string(html_content, False, configuration=pdfkit.configuration(wkhtmltopdf=settings.WKHTMLTOPDF_BIN_PATH))

    # Create an HTTP response with PDF content
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = 'inline; filename="output.pdf"'

    return response

def sales_report(request):
    report_range = request.GET.get('report_range')
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    return_status = request.GET.get('return')
    summary_or_detail = request.GET.get('summary_or_detail')

    if report_range == 'range':
        filter_condition = Q(invoice_date__gte = from_date, invoice_date__lte = to_date)
    elif report_range == 'this-month':
        filter_condition = Q(invoice_date__month = datetime.now().month, invoice_date__year = datetime.now().year)
    elif report_range == 'this-year':
        filter_condition = Q(invoice_date__year = datetime.now().year)
    else:
        filter_condition = Q(invoice_date =  datetime.now().date())

    if return_status == 'return-only':
        include_return = Q(transaction_type = 'return')
    elif return_status == 'exclude-return':
        include_return = Q(transaction_type = 'sales')
    else:
        include_return = Q()

    master = tblSales_Master.objects.filter(filter_condition & include_return)
    
    net = 0
    for entry in master.values():
        if entry['transaction_type'] == 'return':
            entry['net_amount'] = -1 * entry['net_amount']
        net += entry['net_amount']
    
    total = str(net).split('.')
    total_in_words = num2words(total[0])
    
    # master = tblSales_Master.objects.filter(invoice_date__year = datetime.now().year)
    context = {'master': master, 'net_amount': net, 'total_in_words': total_in_words, 'summary_or_detail': summary_or_detail}
    
    if summary_or_detail == 'detail':
        # List to store tuples of master and details
        master_with_details = []

        # Iterate through each master object
        for sale in master:
            # Filter tblSales_Details instances related to this sale
            details_set = tblSales_Details.objects.filter(sales=sale)
            # Append a tuple of master and details to the list
            master_with_details.append({'master': sale, 'details': details_set})

        context['master_with_details'] = master_with_details

    return context

def purchase_report(request):
    report_range = request.GET.get('report_range')
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    return_status = request.GET.get('return')
    summary_or_detail = request.GET.get('summary_or_detail')

    if report_range == 'range':
        filter_condition = Q(invoice_date__gte = from_date, invoice_date__lte = to_date)
    elif report_range == 'this-month':
        filter_condition = Q(invoice_date__month = datetime.now().month, invoice_date__year = datetime.now().year)
    elif report_range == 'this-year':
        filter_condition = Q(invoice_date__year = datetime.now().year)
    else:
        filter_condition = Q(invoice_date =  datetime.now().date())

    if return_status == 'return-only':
        include_return = Q(transaction_type = 'return')
    elif return_status == 'exclude-return':
        include_return = Q(transaction_type = 'purchase')
    else:
        include_return = Q()

    master = tblPurchase_Master.objects.filter(filter_condition & include_return)
    
    net = 0
    for entry in master.values():
        if entry['transaction_type'] == 'return':
            entry['net_amount'] = -1 * entry['net_amount']
        net += entry['net_amount']
    
    total = str(net).split('.')
    total_in_words = num2words(total[0])
    
    context = {'master': master, 'net_amount': net, 'total_in_words': total_in_words, 'summary_or_detail': summary_or_detail}
    
    if summary_or_detail == 'detail':
        # List to store tuples of master and details
        master_with_details = []

        # Iterate through each master object
        for purchase in master:
            details_set = tblPurchase_Details.objects.filter(purchase=purchase)
            # Append a tuple of master and details to the list
            master_with_details.append({'master': purchase, 'details': details_set})

        context['master_with_details'] = master_with_details

    return context

def jv_report(request):
    report_range = request.GET.get('report_range')
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    if report_range == 'range':
        master = tblJournalVoucher_Details.objects.filter(jv__jv_date__gte = from_date, jv__jv_date__lte = to_date).order_by('jv__jv_no', '-debit')
    elif report_range == 'this-month':
        master = tblJournalVoucher_Details.objects.filter(jv__jv_date__month = datetime.now().month, jv__jv_date__year = datetime.now().year).order_by('jv__jv_no', '-debit')
    elif report_range == 'this-year':
        master = tblJournalVoucher_Details.objects.filter(jv__jv_date__year = datetime.now().year).order_by('jv__jv_no', '-debit')
    else:
        master = tblJournalVoucher_Details.objects.filter(jv__jv_date =  datetime.now().date()).order_by('jv__jv_no', '-debit')

    master = JournalVoucherDetailsSerializer(master, many=True)
    context = {'master': master}

    return context

def trial_balance(request):
    report_range = request.GET.get('report_range')
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    
    accounts = tblChartOfAccounts.objects.all()
    context = {"accounts": {}}

    dr = 0
    cr = 0
    
    for account in accounts:
        jv_details = tblJournalVoucher_Details.objects.filter(account=account)
        total_debit = jv_details.aggregate(total_debit=Sum('debit'))['total_debit'] or 0
        total_credit = jv_details.aggregate(total_credit=Sum('credit'))['total_credit'] or 0
        total_amount = jv_details.aggregate(total_amount=Sum('amount'))['total_amount'] or 0
        
        if total_amount != 0:
            context["accounts"][account.account_name] = {}
            context["accounts"][account.account_name]['total_debit'] = '' if total_debit == 0 else total_debit
            context["accounts"][account.account_name]['total_credit'] = '' if total_credit == 0 else total_credit
            context["accounts"][account.account_name]['total_amount'] = total_amount

            dr += total_debit
            cr += total_credit
        context["dr"] = dr
        context["cr"] = cr

    return context

def profit_loss(request):
    opening_stock = tblChartOfAccounts.objects.get(account_code = 150001).opening_balance
    jv_purchase = tblJournalVoucher_Details.objects.filter(account__account_code = 50001)
    jv_purchase_return = tblJournalVoucher_Details.objects.filter(account__account_code = 50002)

    purchase = 0
    purchase_return = 0
    for item in jv_purchase:
        purchase += item.amount
        
    for item in jv_purchase_return:
        purchase_return -= item.amount

    total_purchase = purchase - purchase_return

    expense_accounts = tblChartOfAccounts.objects.filter(account_type='Expense').exclude(account_code__in=['50001', '50002']).values_list('id', flat=True)
    expense = tblJournalVoucher_Details.objects.filter(account__in=expense_accounts)

    expenses = {'opening_stock': opening_stock, 'purchase': purchase, 'purchase_return': purchase_return, 'total_purchase': total_purchase, 'expenses': expense}

    
    jv_sales = tblJournalVoucher_Details.objects.filter(account__account_code = 40001)
    jv_sales_return = tblJournalVoucher_Details.objects.filter(account__account_code = 40002)

    sales = 0
    sales_return = 0
    for item in jv_sales:
        sales -= item.amount
        
    for item in jv_sales_return:
        sales_return += item.amount

    # closing_stock = to_decimal(tblProduct.objects.aggregate(closing_stock=Sum(F('cost_price') * F('stock')))['closing_stock'] or 0)
    closing_stock = 0
    stock_inventory = tblJournalVoucher_Details.objects.filter(account__account_code=150001)
    for stock in stock_inventory:
        closing_stock += stock.amount
        
    total_sales = sales - sales_return

    incomes = {'closing_stock': closing_stock, 'sales': sales, 'sales_return': sales_return, 'total_sales': total_sales}

    total_expense = 0
    for item in expense:
        total_expense += item.amount
    
    total_gross = opening_stock + total_purchase + total_expense - (total_sales + closing_stock)
    
    gross_profit = 0
    gross_loss = 0

    if total_gross > 0:
        gross_loss = total_gross
        total_gross = opening_stock + total_purchase + total_expense
    else:
        total_gross = -1 * total_gross
        gross_profit = total_gross
        total_gross = closing_stock + total_sales

    indirect_expense_accounts = tblChartOfAccounts.objects.filter(account_type='Indirect Expense').values_list('id', flat=True)
    indirect_expense = tblJournalVoucher_Details.objects.filter(account__in=indirect_expense_accounts)

    indirect_income_accounts = tblChartOfAccounts.objects.filter(account_type='Indirect Income').values_list('id', flat=True)
    indirect_income = tblJournalVoucher_Details.objects.filter(account__in=indirect_income_accounts)

    net_income = 0
    net_expense = 0
    net_total = 0

    for item in indirect_expense:
        net_expense += item.amount

    for item in indirect_income:
        net_income -= item.amount
    
    net_total = (-1 * gross_loss) + (-1 * gross_profit) + net_expense - net_income

    net_profit = 0
    net_loss = 0
    if net_total > 0:
        net_loss = net_total
        net_total = gross_loss + gross_profit + net_expense
    else:
        net_profit = -1 * net_total
        net_total = gross_loss + gross_profit + net_income

    context = { 'expenses': expenses, 'incomes': incomes, 'gross_profit': gross_profit, 'gross_loss': gross_loss, 'total_gross': total_gross, 'indirect_expense': indirect_expense, 'indirect_income': indirect_income, 'net_profit': net_profit, 'net_loss': net_loss, 'net_total': net_total }

    return context

def balance_sheet(request):
    pl = profit_loss(request)
    assets_amount = 0
    liabilities_amount = 0
    
    assets_accounts = tblChartOfAccounts.objects.filter(account_type__in=['Current Assets', 'Fixed Assets', 'Bank', 'Accounts Receivable']).order_by('account_code')

    assets = []

    for account in assets_accounts:
        if account.account_type == 'Fixed Assets' and not any(asset.get('account_name') == 'Closing Stock' for asset in assets):
            assets.append({
                'account_name': 'Closing Stock',
                'amount': pl['incomes']['closing_stock']
            })
            assets_amount += pl['incomes']['closing_stock']

        voucher_details = tblJournalVoucher_Details.objects.filter(account=account)

        total_amount = voucher_details.aggregate(Sum('amount'))['amount__sum'] or 0

        if total_amount > 0:
            assets.append({
                'account_name': account.account_name.title(),
                'amount': total_amount
            })
            assets_amount += total_amount
    else:
        if not any(asset.get('account_name') == 'Closing Stock' for asset in assets):
            assets.append({
                'account_name': 'Closing Stock',
                'amount': pl['incomes']['closing_stock']
            })
            assets_amount += pl['incomes']['closing_stock']

    
    liabilities_accounts = tblChartOfAccounts.objects.filter(account_type__in=['Current Liability', 'Long Term Liability', 'Loan', 'Accounts Payable']).order_by('account_code')

    liabilities = []

    for account in liabilities_accounts:
        voucher_details = tblJournalVoucher_Details.objects.filter(account=account)

        total_amount = voucher_details.aggregate(Sum('amount'))['amount__sum'] or 0

        if total_amount > 0:
            liabilities.append({
                'account_name': account.account_name.title(),
                'amount': total_amount
            })
            liabilities_amount += total_amount

    equities_accounts = tblChartOfAccounts.objects.filter(account_type = 'Equity').order_by('account_code')
    
    for account in equities_accounts:
        capital_details = tblJournalVoucher_Details.objects.filter(account=account, amount__lt = 0)
        drawings_details = tblJournalVoucher_Details.objects.filter(account=account, amount__gt = 0)

        total_capital = capital_details.aggregate(Sum('amount'))['amount__sum'] or 0
        total_drawings = drawings_details.aggregate(Sum('amount'))['amount__sum'] or 0

        net_loss = pl['net_loss']
        net_profit = pl['net_profit']
        net_total = (-1 * total_capital) - total_drawings + net_profit - net_loss
        liabilities_amount += net_total

        liabilities.append({
            'account_name': account.account_name.title(),
            'amount': -1 * total_capital,
            'join': True if (total_drawings == 0 and net_loss == 0 and net_profit == 0) else False,
            'total': True if (total_drawings == 0 and net_loss == 0 and net_profit == 0) else False,
            'net_total': net_total
        })

        if total_drawings > 0:
            liabilities.append({
                'account_name': 'Less: Drawings',
                'amount': total_drawings,
                'join': True,
                'total': True if (net_loss == 0 and net_profit == 0) else False,
                'net_total': net_total
            })

        if net_loss > 0:
            liabilities.append({
                'account_name': 'Less: Net Loss',
                'amount': net_loss,
                'join': True,
                'total': True,
                'net_total': net_total
            })
        elif net_profit > 0:
            liabilities.append({
                'account_name': 'Add: Net Profit',
                'amount': net_profit,
                'join': True,
                'total': True,
                'net_total': net_total
            })

    context = {'assets': assets, 'liabilities': liabilities, 'assets_amount': assets_amount, 'liabilities_amount': liabilities_amount}

    return context