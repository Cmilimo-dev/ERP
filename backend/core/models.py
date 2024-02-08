from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.timezone import now

class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, password, **extra_fields)

class tblChartOfAccounts(models.Model):
    id = models.BigAutoField(primary_key=True)
    account_code = models.CharField(max_length=20, default='', unique=True)
    account_name = models.CharField(max_length=50, default='', unique=True)
    account_type = models.CharField(max_length=50, default='')
    sub_account = models.CharField(max_length=50, default='', blank=True, null=True)
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)
    description = models.CharField(max_length=255, default='', blank=True, null=True)
    bank_account = models.CharField(max_length = 50, default='', blank=True, null=True)
    account_holder = models.CharField(max_length = 50, default='', blank=True, null=True)
    locked = models.BooleanField(default=False)
    
class tblCompanyInformation(models.Model):
    id = models.BigAutoField(primary_key=True)
    company_name = models.CharField(max_length=255, default='')
    address = models.CharField(max_length=255, default='', blank=True, null=True)
    trn = models.CharField(max_length=100, default='', blank=True, null=True)
    telephone1 = models.CharField(max_length=25, default='', blank=True, null=True)
    telephone2 = models.CharField(max_length=25, default='', blank=True, null=True)
    mobile1 = models.CharField(max_length=25, default='', blank=True, null=True)
    mobile2 = models.CharField(max_length=25, default='', blank=True, null=True)
    whatsapp = models.CharField(max_length=25, default='', blank=True, null=True)
    fax = models.CharField(max_length=25, default='', blank=True, null=True)
    email = models.CharField(max_length=100, default='', blank=True, null=True)
    website = models.CharField(max_length=100, default='', blank=True, null=True)
    fy_start_date = models.DateField(blank=True, null=True)
    fy_end_date = models.DateField(blank=True, null=True)
    active_accounting_period_from = models.DateField(blank=True, null=True)
    active_accounting_period_to = models.DateField(blank=True, null=True)
    last_vat_return = models.DateField(blank=True, null=True)
    next_vat_return = models.DateField(blank=True, null=True)
    last_sales_close_date = models.DateField(blank=True, null=True)
    invoice_form = models.CharField(default='', max_length=100, blank=True, null=True)
    default_attention = models.CharField(max_length=100, default='', blank=True, null=True)
    default_cash_account = models.ForeignKey(tblChartOfAccounts, related_name='default_cash_account', on_delete=models.PROTECT, blank=True, null=True)
    default_bank_account = models.ForeignKey(tblChartOfAccounts, related_name='default_bank_account', on_delete=models.PROTECT, blank=True, null=True)
    default_sales_account = models.ForeignKey(tblChartOfAccounts, related_name='default_sales_account', on_delete=models.PROTECT, blank=True, null=True)
    default_purchase_account = models.ForeignKey(tblChartOfAccounts, related_name='default_purchase_account', on_delete=models.PROTECT, blank=True, null=True)
    default_sales_return_account = models.ForeignKey(tblChartOfAccounts, related_name='default_sales_return_account', on_delete=models.PROTECT, blank=True, null=True)
    default_purchase_return_account = models.ForeignKey(tblChartOfAccounts, related_name='default_purchase_return_account', on_delete=models.PROTECT, blank=True, null=True)
    default_accounts_receivable_account = models.ForeignKey(tblChartOfAccounts, related_name='default_accounts_receivable_account', on_delete=models.PROTECT, blank=True, null=True)
    default_accounts_payable_account = models.ForeignKey(tblChartOfAccounts, related_name='default_accounts_payable_account', on_delete=models.PROTECT, blank=True, null=True)
    default_vat_recoverable_account = models.ForeignKey(tblChartOfAccounts, related_name='default_vat_recoverable_account', on_delete=models.PROTECT, blank=True, null=True)
    default_vat_payable_account = models.ForeignKey(tblChartOfAccounts, related_name='default_vat_payable_account', on_delete=models.PROTECT, blank=True, null=True)
    default_credit_card_account = models.ForeignKey(tblChartOfAccounts, related_name='default_credit_card_account', on_delete=models.PROTECT, blank=True, null=True)
    default_credit_card_bank_account = models.ForeignKey(tblChartOfAccounts, related_name='default_credit_card_bank_account', on_delete=models.PROTECT, blank=True, null=True)
    default_credit_card_commission_account = models.ForeignKey(tblChartOfAccounts, related_name='default_credit_card_commission_account', on_delete=models.PROTECT, blank=True, null=True)
    default_pettycash_account = models.ForeignKey(tblChartOfAccounts, related_name='default_pettycash_account', on_delete=models.PROTECT, blank=True, null=True)
    default_depreciation_account = models.ForeignKey(tblChartOfAccounts, related_name='default_depreciation_account', on_delete=models.PROTECT, blank=True, null=True)
    default_bad_debts_account = models.ForeignKey(tblChartOfAccounts, related_name='default_bad_debts_account', on_delete=models.PROTECT, blank=True, null=True)
    default_sales_discount_account = models.ForeignKey(tblChartOfAccounts, related_name='default_sales_discount_account', on_delete=models.PROTECT, blank=True, null=True)
    default_purchase_discount_account = models.ForeignKey(tblChartOfAccounts, related_name='default_purchase_discount_account', on_delete=models.PROTECT, blank=True, null=True)
    default_inventory_account = models.ForeignKey(tblChartOfAccounts, related_name='default_inventory_account', on_delete=models.PROTECT, blank=True, null=True)
    default_pdc_issued_account = models.ForeignKey(tblChartOfAccounts, related_name='default_pdc_issued_account', on_delete=models.PROTECT, blank=True, null=True)
    default_pdc_received_account = models.ForeignKey(tblChartOfAccounts, related_name='default_pdc_received_account', on_delete=models.PROTECT, blank=True, null=True)

class tblUsers(AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True, db_column='ID')  # Field name made lowercase.
    username = models.CharField(unique=True, max_length=250, default='')
    email = models.EmailField(max_length=250, default='')
    permissionlevel = models.SmallIntegerField(db_column='PermissionLevel', default=0)  # Field name made lowercase.
    password = models.CharField(db_column='Password', max_length=250, default='')  # Field name made lowercase.
    fullname = models.CharField(db_column='FirstName', max_length=250, default='')  # Field name made lowercase.
    designation = models.CharField(db_column='Designation', max_length=250, default='')  # Field name made lowercase.
    createdon = models.DateTimeField(db_column='CreatedOn', default=now())  # Field name made lowercase.
    createdby = models.BigIntegerField(db_column='CreatedBy', default=0)  # Field name made lowercase.
    modifiedon = models.DateTimeField(db_column='ModifiedOn', default=now())  # Field name made lowercase.
    modifiedby = models.BigIntegerField(db_column='ModifiedBy', default=0)  # Field name made lowercase.
    is_staff = models.BooleanField(db_column='IsStaff', default=False) #
    is_active = models.BooleanField(db_column='IsActive', default=True) #

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'  # Define the field used as the username
    REQUIRED_FIELDS = ['password', 'email']

class tblCategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    category_code = models.CharField(max_length=10, unique=True, default='')
    category_name = models.CharField(max_length=50, default='')

class tblEmployee(models.Model):
    id = models.BigAutoField(primary_key=True)
    employee_code = models.CharField(max_length=10, unique=True, default='')
    employee_name = models.CharField(max_length=100, default='')
    profession = models.CharField(max_length=100, default='')
    join_date = models.DateField(default=now(), null=True, blank=True)
    present_status = models.CharField(max_length=20, default='', null=True, blank=True)
    passport_no = models.CharField(max_length=25, default='', null=True, blank=True)
    passport_expiry = models.DateField(default=now(), null=True, blank=True)
    emirates_id = models.CharField(max_length=25, default='', null=True, blank=True)
    labour_card = models.CharField(max_length=25, default='', null=True, blank=True)
    visa_no = models.CharField(max_length=25, default='', null=True, blank=True)
    visa_expiry = models.DateField(default=now(), null=True, blank=True)
    health_insurance = models.CharField(max_length=25, default='', null=True, blank=True)
    health_insurance_expiry = models.DateField(default=now(), null=True, blank=True)
    basic_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    address = models.CharField(max_length=255, default='', null=True, blank=True)
    phone_no = models.CharField(max_length=25, default='', null=True, blank=True)
    mobile = models.CharField(max_length=25, default='', null=True, blank=True)
    email = models.EmailField(max_length=200, default='', null=True, blank=True)

    
class tblVendor(models.Model):
    id = models.BigAutoField(primary_key=True)
    vendor_code = models.CharField(max_length=10, unique=True, default='')
    vendor_name = models.CharField(max_length=255, default='')
    trn = models.CharField(max_length=50, default='', blank=True, null=True)
    address = models.CharField(max_length=255, default= '')
    city = models.CharField(max_length=50, default = '', blank=True, null=True)
    state = models.CharField(max_length=50, default = '', blank=True, null=True)
    country = models.CharField(max_length=50, default = '', blank=True, null=True)
    contact_person = models.CharField(max_length=50, default = '', blank=True, null=True)
    mobile = models.CharField(max_length=20, default='')
    phone = models.CharField(max_length=20, default = '', blank=True, null=True)
    fax = models.CharField(max_length=20, default = '', blank=True, null=True)
    email = models.EmailField(default='')
    credit_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    credit_alert = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    credit_days = models.IntegerField(default=0, blank=True, null=True)

class tblProduct(models.Model):
    id = models.BigAutoField(primary_key=True)
    product_code = models.CharField(max_length=10, unique=True, default='')
    product_name = models.CharField(max_length=255, default='')
    main_unit = models.CharField(max_length=10, default='pcs')
    multiple_units = models.BooleanField(default=True)
    description = models.TextField(max_length=255, default='', blank=True, null=True)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    vat_perc = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_purchase_price = models.DecimalField(max_digits=12, decimal_places=2,default=0, blank=True, null=True)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2,default=0, blank=True, null=True)
    type = models.CharField(max_length=20, blank=True, null=True, default='stock')
    stock = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    stock_on_delivery = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    vendor = models.ForeignKey(tblVendor, on_delete=models.DO_NOTHING, blank=True, null=True)
    category = models.ForeignKey(tblCategory, on_delete=models.PROTECT, blank=True, null=True)
    inventory_account = models.ForeignKey(tblChartOfAccounts, related_name='inventory_account', on_delete=models.PROTECT, blank=True, null=True, default=None)
    cost_account = models.ForeignKey(tblChartOfAccounts, related_name='cost_account', on_delete=models.PROTECT, blank=True, null=True, default=None)
    income_account = models.ForeignKey(tblChartOfAccounts, related_name='income_account', on_delete=models.PROTECT, blank=True, null=True, default=None)

class tblProduct_unit(models.Model):
    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(tblProduct, on_delete=models.CASCADE)
    unit = models.CharField(max_length=10, default='')
    multiple = models.CharField(max_length=1, default='*')
    multiple_value = models.DecimalField(max_digits=12, decimal_places=2, default=1)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)

class tblCustomer(models.Model):
    id = models.BigAutoField(primary_key=True)
    customer_code = models.CharField(max_length=10, unique=True, default='')
    customer_name = models.CharField(max_length=255, default='')
    trn = models.CharField(max_length=50, default='', blank=True, null=True)
    address = models.CharField(max_length=255, default= '')
    city = models.CharField(max_length=50, default = '', blank=True, null=True)
    state = models.CharField(max_length=50, default = '', blank=True, null=True)
    country = models.CharField(max_length=50, default = '', blank=True, null=True)
    contact_person = models.CharField(max_length=50, default = '', blank=True, null=True)
    mobile = models.CharField(max_length=20, default='')
    phone = models.CharField(max_length=20, default = '', blank=True, null=True)
    fax = models.CharField(max_length=20, default = '', blank=True, null=True)
    email = models.EmailField(default='')
    credit_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    credit_alert = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    credit_days = models.IntegerField(default=0, blank=True, null=True)

class tblSales_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    return_no = models.CharField(max_length=15, default='', blank=True, null=True)
    invoice_no = models.CharField(max_length=15, default='', blank=True, null=True)
    invoice_date = models.DateField(default=now())
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    roundoff = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_received = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=15, default='cash')
    customer = models.ForeignKey(tblCustomer, on_delete=models.DO_NOTHING)
    salesman = models.ForeignKey(tblEmployee, on_delete=models.DO_NOTHING, blank=True, null=True)
    transaction_type = models.CharField(max_length=10, default='sales')

class tblSales_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    sales = models.ForeignKey(tblSales_Master, on_delete=models.CASCADE)
    product = models.ForeignKey(tblProduct, on_delete=models.DO_NOTHING)
    product_name = models.CharField(max_length=255, default='')
    unit = models.CharField(max_length=10, default='pcs')
    stock = models.DecimalField(max_digits=12, decimal_places=2,default=0, blank=True, null=True)
    qty = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_perc = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def get_units(self):
        return tblProduct_unit.objects.filter(product=self.product)

class tblPurchase_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    return_no = models.CharField(max_length=15, default='', blank=True, null=True)
    invoice_no = models.CharField(max_length=15, default='', blank=True, null=True)
    purchase_no = models.CharField(max_length=15, default='', blank=True, null=True)
    invoice_date = models.DateField(default=now())
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    roundoff = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_payed = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=15, default='cash')
    vendor = models.ForeignKey(tblVendor, on_delete=models.DO_NOTHING)
    salesman = models.ForeignKey(tblEmployee, on_delete=models.DO_NOTHING, blank=True, null=True)
    transaction_type = models.CharField(max_length=10, default='purchase')

class tblPurchase_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    purchase = models.ForeignKey(tblPurchase_Master, on_delete=models.CASCADE)
    product = models.ForeignKey(tblProduct, on_delete=models.DO_NOTHING)
    product_name = models.CharField(max_length=255, default='')
    unit = models.CharField(max_length=10, default='pcs')
    qty = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_perc = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    previous_purchase_price = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)

    def get_units(self):
        return tblProduct_unit.objects.filter(product=self.product)

class tblSalesOrder_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    order_no = models.CharField(max_length=15, default='')
    order_date = models.DateField(default=now())
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    roundoff = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    customer = models.ForeignKey(tblCustomer, on_delete=models.DO_NOTHING)
    salesman = models.ForeignKey(tblEmployee, on_delete=models.DO_NOTHING, blank=True, null=True)

class tblSalesOrder_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    sales_order = models.ForeignKey(tblSalesOrder_Master, on_delete=models.CASCADE)
    product = models.ForeignKey(tblProduct, on_delete=models.DO_NOTHING)
    product_name = models.CharField(max_length=255, default='')
    unit = models.CharField(max_length=10, default='pcs')
    stock = models.DecimalField(max_digits=12, decimal_places=2,default=0, blank=True, null=True)
    qty = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_perc = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def get_units(self):
        return tblProduct_unit.objects.filter(product=self.product)

class tblPurchaseOrder_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    order_no = models.CharField(max_length=15, default='')
    order_date = models.DateField(default=now())
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    roundoff = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vendor = models.ForeignKey(tblVendor, on_delete=models.DO_NOTHING)
    salesman = models.ForeignKey(tblEmployee, on_delete=models.DO_NOTHING, blank=True, null=True)
    
class tblPurchaseOrder_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    purchase_order = models.ForeignKey(tblPurchaseOrder_Master, on_delete=models.CASCADE)
    product = models.ForeignKey(tblProduct, on_delete=models.DO_NOTHING)
    product_name = models.CharField(max_length=255, default='')
    unit = models.CharField(max_length=10, default='pcs')
    qty = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_perc = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def get_units(self):
        return tblProduct_unit.objects.filter(product=self.product)
    
class tblQuotation_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    quotation_no = models.CharField(max_length=15, default='')
    quotation_date = models.DateField(default=now())
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    roundoff = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    valid_till = models.DateField(default=now())
    customer = models.ForeignKey(tblCustomer, on_delete=models.DO_NOTHING)
    salesman = models.ForeignKey(tblEmployee, on_delete=models.DO_NOTHING, blank=True, null=True)
    
class tblQuotation_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    quotation = models.ForeignKey(tblQuotation_Master, on_delete=models.CASCADE)
    product = models.ForeignKey(tblProduct, on_delete=models.DO_NOTHING)
    product_name = models.CharField(max_length=255, default='')
    unit = models.CharField(max_length=10, default='pcs')
    qty = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_perc = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def get_units(self):
        return tblProduct_unit.objects.filter(product=self.product)

class tblPreforma_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    preforma_no = models.CharField(max_length=15, default='')
    preforma_date = models.DateField(default=now())
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    roundoff = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    customer = models.ForeignKey(tblCustomer, on_delete=models.DO_NOTHING)
    salesman = models.ForeignKey(tblEmployee, on_delete=models.DO_NOTHING, blank=True, null=True)
    
class tblPreforma_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    preforma = models.ForeignKey(tblPreforma_Master, on_delete=models.CASCADE)
    product = models.ForeignKey(tblProduct, on_delete=models.DO_NOTHING)
    product_name = models.CharField(max_length=255, default='')
    unit = models.CharField(max_length=10, default='pcs')
    qty = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_perc = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def get_units(self):
        return tblProduct_unit.objects.filter(product=self.product)

class tblRFQ_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    rfq_no = models.CharField(max_length=15, default='')
    rfq_date = models.DateField(default=now())
    vendor = models.ForeignKey(tblVendor, on_delete=models.DO_NOTHING)
    salesman = models.ForeignKey(tblEmployee, on_delete=models.DO_NOTHING, blank=True, null=True)
    
class tblRFQ_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    rfq = models.ForeignKey(tblRFQ_Master, on_delete=models.CASCADE)
    product = models.ForeignKey(tblProduct, on_delete=models.DO_NOTHING)
    product_name = models.CharField(max_length=255, default='')
    unit = models.CharField(max_length=10, default='pcs')
    qty = models.DecimalField(max_digits=12, decimal_places=2,default=0)

    def get_units(self):
        return tblProduct_unit.objects.filter(product=self.product)

class tblDeliveryNote_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    delivery_note_no = models.CharField(max_length=15, default='')
    delivery_note_date = models.DateField(default=now())
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    roundoff = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    customer = models.ForeignKey(tblCustomer, on_delete=models.DO_NOTHING)
    salesman = models.ForeignKey(tblEmployee, on_delete=models.DO_NOTHING, blank=True, null=True)

class tblDeliveryNote_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    delivery_note = models.ForeignKey(tblDeliveryNote_Master, on_delete=models.CASCADE)
    product = models.ForeignKey(tblProduct, on_delete=models.DO_NOTHING)
    product_name = models.CharField(max_length=255, default='')
    unit = models.CharField(max_length=10, default='pcs')
    stock = models.DecimalField(max_digits=12, decimal_places=2,default=0, blank=True, null=True)
    qty = models.DecimalField(max_digits=12, decimal_places=2,default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_perc = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    item_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def get_units(self):
        return tblProduct_unit.objects.filter(product=self.product)
    
class tblAccountsReceivables(models.Model):
    id = models.BigAutoField(primary_key=True)
    customer = models.ForeignKey(tblCustomer, related_name="customer", on_delete=models.DO_NOTHING)
    invoice = models.ForeignKey(tblSales_Master, related_name="invoice", on_delete=models.CASCADE)
    due_date = models.DateField(default=now())
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cheque_no = models.CharField(max_length=100, default='', null=True, blank=True)
    cheque_date = models.DateField(null=True, blank=True)
    cheque_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
class tblAccountsPayables(models.Model):
    id = models.BigAutoField(primary_key=True)
    vendor = models.ForeignKey(tblVendor, related_name="vendor", on_delete=models.DO_NOTHING)
    invoice = models.ForeignKey(tblPurchase_Master, related_name="invoice", on_delete=models.CASCADE)
    due_date = models.DateField(default=now())
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cheque_no = models.CharField(max_length=100, default='', null=True, blank=True)
    cheque_date = models.DateField(null=True, blank=True)
    cheque_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

class tblJournalVoucher_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    jv_no = models.IntegerField(default=0)
    jv_date = models.DateField(default=now())
    transaction_type = models.CharField(max_length=150, default='JV')
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    description = models.CharField(max_length=255, default='', blank=True, null=True)
    master_id = models.CharField(default='', max_length=150, blank=True, null=True)
    
class tblJournalVoucher_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    jv = models.ForeignKey(tblJournalVoucher_Master, on_delete=models.CASCADE)
    account = models.ForeignKey(tblChartOfAccounts, default="", on_delete=models.CASCADE)
    name = models.CharField(max_length=150, default="", blank=True, null=True)
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def getAccounts():
        return tblChartOfAccounts.objects.all()

class tblPayment(models.Model):
    id = models.BigAutoField(primary_key=True)
    payment_no = models.IntegerField()
    payment_date = models.DateField(default=now())
    vendor = models.ForeignKey(tblVendor, on_delete=models.DO_NOTHING, blank=True, null=True)
    payment_to = models.CharField(max_length=150, default="", blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    payment_method = models.CharField(max_length=15, default='cash')
    cheque_no = models.CharField(max_length=50, default="", blank=True, null=True)
    cheque_date = models.DateField(default=now(), blank=True, null=True)
    
class tblReceipt(models.Model):
    id = models.BigAutoField(primary_key=True)
    receipt_no = models.IntegerField()
    receipt_date = models.DateField(default=now())
    customer = models.ForeignKey(tblCustomer, on_delete=models.DO_NOTHING, blank=True, null=True)
    receipt_from = models.CharField(max_length=150, default="", blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, blank=True, null=True)
    payment_method = models.CharField(max_length=15, default='cash')
    cheque_no = models.CharField(max_length=50, default="", blank=True, null=True)
    cheque_date = models.DateField(default=now(), blank=True, null=True)
    
class tblPettyCash_Master(models.Model):
    id = models.BigAutoField(primary_key=True)
    transaction_no = models.IntegerField()
    transaction_date = models.DateField(default=now())
    petty_cash_account = models.ForeignKey(tblChartOfAccounts, on_delete=models.DO_NOTHING)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

class tblPettyCash_Details(models.Model):
    id = models.BigAutoField(primary_key=True)
    petty_cash = models.ForeignKey(tblPettyCash_Master, on_delete=models.CASCADE)
    account = models.ForeignKey(tblChartOfAccounts, on_delete=models.DO_NOTHING)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    remarks = models.CharField(max_length=255, blank=True, null=True)