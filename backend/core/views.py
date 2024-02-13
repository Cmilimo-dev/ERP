from django.apps import apps
from django.forms import model_to_dict
from django.shortcuts import get_object_or_404, render, redirect

from django.contrib import messages
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.hashers import make_password

from django.db import transaction
from django.db.models import Q, Max, Sum, F
import json
from django.db import connection

from datetime import datetime, timedelta
from django.utils.timezone import now

from django.template.loader import get_template
import pdfkit
from django.conf import settings
from .convertions import to_decimal, to_integer
from num2words import num2words

from . models import tblAccountsPayables, tblAccountsReceivables, tblChartOfAccounts, tblCompanyInformation, tblPettyCash_Details, tblPettyCash_Master, tblUsers, tblSales_Details, tblSales_Master, tblCustomer, tblPurchase_Master, tblPurchase_Details, tblVendor, tblProduct, tblProduct_unit, tblCategory, tblEmployee, tblSalesOrder_Master, tblSalesOrder_Details, tblPurchaseOrder_Master, tblPurchaseOrder_Details, tblRFQ_Master, tblRFQ_Details, tblQuotation_Master, tblQuotation_Details, tblPreforma_Master, tblPreforma_Details,tblDeliveryNote_Master, tblDeliveryNote_Details, tblPayment, tblReceipt, tblJournalVoucher_Master, tblJournalVoucher_Details

from django.http import JsonResponse, HttpResponse
from django.middleware.csrf import get_token

from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser

from .serializers import AccountsPayablesSerializer, AccountsReceivablesSerializer, CompanySerializer, CustomerSerializer, DeliveryNoteDetailsSerializer, DeliveryNoteSerializer, JournalVoucherDetailsSerializer, JournalVoucherSerializer, PaymentSerializer, PettyCashDetailsSerializer, PettyCashSerializer, PreformaDetailsSerializer, PreformaSerializer, PurchaseDetailsSerializer, PurchaseOrderDetailsSerializer, PurchaseOrderSerializer, PurchaseSerializer, QuotationDetailsSerializer, QuotationSerializer, ReceiptSerializer, SalesOrderDetailsSerializer, SalesOrderSerializer, VendorSerializer, AccountSerializer, CategorySerializer, EmployeeSerializer, ProductSerializer, ProductUnitSerializer, RFQSerializer, RFQDetailsSerializer, SalesSerializer, SalesDetailsSerializer

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

def index(request):
    return redirect('home')

def loginPage(request):
    # if request.user.is_authenticated:
    #     return redirect('index')
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        try:
            user = tblUsers.objects.get(username=username)
        except tblUsers.DoesNotExist:
            messages.message(request, 'User not found')
            return redirect('login')
        
        
        user_login = authenticate(request, username=username, password=password)

        if user_login is not None:
            login(request, user_login)
            return redirect('home')
        else:
            messages.message(request, "Invalid password")
            request.session['data'] = { 'username' : username }
            return redirect('login')
        
    if request.session.get('data'):
        context = request.session.get('data')
        del request.session['data']
    else:
        context = {}

    return render(request, 'login.html', context)

def registerPage(request):
    # if request.user.is_authenticated:
    #     return redirect('index')
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')

        if tblUsers.objects.filter(username=username).exists():
            messages.info(request, 'Username already taken')
            request.session['data'] = { 
            'username': username, 
            'email': email,
            }
            return redirect('register')
        if len(password) < 4 or len(password) > 10:
            messages.info(request, 'Password must be between 4 to 10 characters')
            request.session['data'] = { 
            'username': username,
            'email': email,
            }
            return redirect('register')
        else:
            hashed_password = make_password(password)
            x = tblUsers.objects.create(
                username=username,
                email=email,
                password=hashed_password, 
            )
            x.save()
            user_login = authenticate(request, username=username, password=password)

            if user_login is not None:
                login(request, user_login)
                return redirect('home')
                
    if request.session.get('data'):
        context = request.session.get('data')
        del request.session['data']
    else:
        context = { }

    return render(request, 'register.html', context)

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

def get_cookie(request):
    return JsonResponse({'cookie': get_token(request)})



    

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
                        customer = customer,
                        salesman = tblEmployee.objects.get(id=salesman) if salesman > 0 else None,
                        transaction_type = 'return' if to_return else 'sales'
                    )
                if (to_return):
                    customer.credit_balance = to_decimal(customer.credit_balance) - balance
                else:
                    customer.credit_balance = to_decimal(customer.credit_balance) + balance
                customer.save()

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
                if to_return and balance > 0:
                    accounts_receivable = tblAccountsReceivables.objects.get(invoice=tblSales_Master.objects.get(invoice_no = master_data['invoice_no'], transaction_type = 'sales'))
                    accounts_receivable.amount = accounts_receivable.amount - balance
                    accounts_receivable.balance = accounts_receivable.balance - balance
                    accounts_receivable.save()
                elif balance > 0:
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
                        vendor = vendor,
                        salesman = salesman,
                        transaction_type = 'return' if to_return else 'purchase'
                    )
                    
                if (to_return):
                    vendor.credit_balance = to_decimal(vendor.credit_balance) - balance
                else:
                    vendor.credit_balance = to_decimal(vendor.credit_balance) + balance
                vendor.save()

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
                
                if to_return and balance > 0:
                    accounts_payables = tblAccountsPayables.objects.get(invoice=tblPurchase_Master.objects.get(invoice_no = master_data['invoice_no'], transaction_type = 'purchase'))
                    accounts_payables.amount = accounts_payables.amount - balance
                    accounts_payables.balance = accounts_payables.balance - balance
                    accounts_payables.save()
                elif balance > 0:
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
                        if total == 0:
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
                        if total == 0:
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
                    if total == 0:
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
                        if total == 0:
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
                        if total == 0:
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
                    if total == 0:
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
            petty_cash = tblPettyCash_Master.objects.get(id=id)
            petty_cash.delete()
            return JsonResponse({"status": "success", "message": 'Successfully deleted the Petty Cash'})
        except Exception as e:
            logger.exception("An error occurred: %s", str(e))
            return JsonResponse({"status": "failed", 'message': 'Failed to delete the Petty Cash'})
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