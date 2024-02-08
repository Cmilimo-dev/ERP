# 🏪 ERP
<details>

  <summary>Table of Contents</summary>
      🔶 <a href="#-about-the-project">About The Project</a><br>
        &emsp;🔹<a href="#-features">Features</a><br>
        &emsp;🔹<a href="#-modules">Modules</a><br>
        &emsp;🔹<a href="#home-page">Home Page</a><br>
        &emsp;🔹<a href="#product-page">Product Page</a><br>
        &emsp;🔹<a href="#sales-page">Sales Page</a><br>
      🔶 <a href="#-built-with">Built With</a><br>
      🔶 <a href="#-getting-started">Getting Started</a><br>
</details>



<!-- ABOUT THE PROJECT -->
## 🚀 About The Project
A web based ERP solution designed for businesses seeking seamless management of their operations. The project includes invoice generation, report generation in pdf format. Manage Accounts, Product, Customers, Sales and much more with this application. It also includes the ability to make journal entries apart from the auto generated entries from sales, purchase, receipt and payment modules.

### 💎 Features
    🔹Multiple Unit Support
    🔹Accounting Report
    🔹Invoice Print
    🔹Dynamically added table
    🔹Shortcut keys

### 📁 Modules
    🔹category
    🔹employee 
    🔹product 
    🔹customer
    🔹vendor
    🔹sales
    🔹purchase
    🔹sales return
    🔹purchase return
    🔹Quotation
    🔹Preforma Invoice
    🔹sales Order
    🔹Delivery Note
    🔹RFQ
    🔹purchase Order
    🔹Payment
    🔹Receipt
    🔹Chart Of Accounts
    🔹Journal Voucher
    🔹Petty Cash

<h3>Home Page</h3>
<img src="https://github.com/MhdIr7an/ERP/assets/93046265/74a942e7-1470-4aaf-81f7-1c03e38e1f40" width="800" height="400" />

<h3>Product Page</h3>
<img src="https://github.com/MhdIr7an/ERP/assets/93046265/add562b0-67dc-463c-8a17-e08a7616e758" width="800" height="400" />

<h3>Sales Page</h3>
<img src="https://github.com/MhdIr7an/ERP/assets/93046265/d243345d-0a1b-49b6-bfa7-c2c9464941b8" width="800" height="400" />



## 🧰 Built With
<div>
<img alt="Nextjs Icon" width="120" height="80" src="https://cdn.icon-icons.com/icons2/3392/PNG/512/nextjs_icon_213852.png">
<img alt="React Icon" width="120" height="80" src="https://cdn.icon-icons.com/icons2/2415/PNG/512/react_original_logo_icon_146374.png">
<img alt="Django Icon" width="120" height="90" src="https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_django_icon_130645.png">
<img alt="Javascript Icon" width="100" height="80" src="https://cdn.icon-icons.com/icons2/2415/PNG/512/javascript_original_logo_icon_146455.png">
<img alt="Tailwind css" width="100" height="80" src="https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_tailwind_icon_130128.png">
<img alt="Css Icon" width="100" height="80" src="https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_css_icon_130661.png">
<img alt="Html Icon" width="100" height="80" src="https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_html_icon_130541.png">
</div>

<!-- GETTING STARTED -->
## 🚪 Getting Started

To get a local copy up and running follow these simple example steps.

1. Clone the repo
   ```sh
   git clone https://github.com/MhdIr7an/ERP.git
   ```
2. Navigate to frontend folder
   ```sh
   cd frontend
   ```
3. Install dependencies
   ```sh
   npm install
   ```
4. Run development server
   ```sh
   npm run dev
   ```
5. Rename .env.example to .env and specify backend api url
6. Go back to root folder then navigate to backend folder
   ```sh
   cd..
   cd backend
   ```
7. Install requirements
   ```sh
   pip install -r requirements.txt
   ```
8. Download and install WKHTMLTOPDF(required to generate pdf) to C:\Program Files\ from <a href="https://wkhtmltopdf.org/downloads.html">here</a>
9. Rename .env.example file to .env then add SECRET_KEY(Your django secret key) and database details. 
5. run server
   ```sh
   pip manage.py runserver
   ```

<p align="right">(<a href="#-erp">back to top</a>)<p>
