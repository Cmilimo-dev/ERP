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
A web based ERP solution designed for businesses seeking seamless management of their operations. The project includes invoice & report generation in pdf format. Manage Accounts, Product, Customers, Sales and much more with this application.

### 💎 Features
   🔹Multiple Unit Support<br>
   🔹Accounting Report<br>
   🔹Invoice Print<br>
   🔹Dynamically added table<br>
   🔹Shortcut keys<br>

### 📁 Modules
   🔹category<br>
   🔹employee<br>
   🔹product<br>
   🔹customer<br>
   🔹vendor<br>
   🔹sales<br>
   🔹purchase<br>
   🔹sales return<br>
   🔹purchase return<br>
   🔹Quotation<br>
   🔹Preforma Invoice<br>
   🔹sales Order<br>
   🔹Delivery Note<br>
   🔹RFQ<br>
   🔹purchase Order<br>
   🔹Payment<br>
   🔹Receipt<br>
   🔹Chart Of Accounts<br>
   🔹Journal Voucher<br>
   🔹Petty Cash<br>

<h3>Home Page</h3>
<img src="https://github.com/MhdIr7an/ERP/assets/93046265/74a942e7-1470-4aaf-81f7-1c03e38e1f40" width="800" height="400" />

<h3>Product Page</h3>
<img src="https://github.com/MhdIr7an/ERP/assets/93046265/add562b0-67dc-463c-8a17-e08a7616e758" width="800" height="400" />

<h3>Sales Page</h3>
<img src="https://github.com/MhdIr7an/ERP/assets/93046265/d243345d-0a1b-49b6-bfa7-c2c9464941b8" width="800" height="400" />



## 🧰 Built With
<div><img alt="Nextjs Icon" width="20" height="15" src="https://cdn.icon-icons.com/icons2/3392/PNG/512/nextjs_icon_213852.png">&nbsp;Nextjs</div>
<div><img alt="React Icon" width="20" height="15" src="https://cdn.icon-icons.com/icons2/2415/PNG/512/react_original_logo_icon_146374.png">&nbsp;Reactjs</div>
<div><img alt="Django Icon" width="20" height="15" src="https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_django_icon_130645.png">&nbsp;Django</div>
<div><img alt="Docker Icon" width="20" height="15" src="https://img.icons8.com/?size=48&id=cdYUlRaag9G9&format=png">&nbsp;Docker</div>
<div><img alt="Supabase Icon" width="20" height="15" src="https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png">&nbsp;Supabase</div>
<div><img alt="Javascript Icon" width="20" height="15" src="https://cdn.icon-icons.com/icons2/2415/PNG/512/javascript_original_logo_icon_146455.png">&nbsp;Javascript</div>
<div><img alt="Tailwind css" width="20" height="15" src="https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_tailwind_icon_130128.png">&nbsp;Tailwindcss</div>
<div><img alt="Css Icon" width="20" height="15" src="https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_css_icon_130661.png">&nbsp;css</div>
<div><img alt="Html Icon" width="20" height="15" src="https://cdn.icon-icons.com/icons2/2107/PNG/512/file_type_html_icon_130541.png">&nbsp;Html</div>

<!-- GETTING STARTED -->
## 🚪 Getting Started

To get a local copy up and running follow these simple steps:
   
1. Clone the repo
   ```sh
   git clone https://github.com/MhdIr7an/ERP.git
   ```
Steps to follow if docker is installed:

2. Run docker-compose build
   ```sh
   docker-compose build
   ```
3. Run docker-compose up
   ```sh
   docker-compose up
   ```

Steps to follow if not using docker:

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
8. Download and install WKHTMLTOPDF(required to generate pdf) from <a href="https://wkhtmltopdf.org/downloads.html">here</a> and specify the path to wkhtmltopdf.exe
9. Rename .env.example file to .env then add SECRET_KEY(Your django secret key) and supabase database details. 
10. run server
   ```sh
   pip manage.py runserver
   ```

<p align="right">(<a href="#-erp">back to top</a>)<p>
