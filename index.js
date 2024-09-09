import express from 'express';
import httpProxy from 'http-proxy';
import fs from 'fs'
import bodyParser from 'body-parser'
import path from 'path'

const app = express();
const PORT = process.env.PORT || 8080
const proxy = httpProxy.createProxyServer({ changeOrigin: true });
const dbFilePath = path.join(__dirname, 'database.json');

// Middleware لتحليل بيانات الـ POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// قراءة البيانات من ملف database.json
const readDatabase = () => {
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify([]));  // إنشاء ملف إذا لم يكن موجوداً
  }
  const data = fs.readFileSync(dbFilePath);
  return JSON.parse(data);
};

// كتابة البيانات إلى ملف database.json
const writeDatabase = (data) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));  // تنسيق البيانات وحفظها في الملف
};

// تقديم الصفحة الرئيسية (HTML) عند الوصول إلى '/'
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>URL Management</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>Manage URLs</h1>

    <div class="container">
        <!-- Form لإضافة URL جديد -->
        <form id="add-url-form">
            <h2>Add URL</h2>
            <label for="path">Path:</label>
            <input type="text" id="add-path" name="path" required>
            <label for="url">URL:</label>
            <input type="text" id="add-url" name="url" required>
            <button type="submit">Add URL</button>
<main id="pth"></main>
        </form>

        <!-- Form لحذف URL -->
        <form id="delete-url-form">
            <h2>Delete URL</h2>
            <label for="delete-path">Path to delete:</label>
            <input type="text" id="delete-path" name="path" required>
            <button type="submit">Delete URL</button>
        </form>
    </div>

    <div id="results">
        <!-- نتائج العرض سيتم إضافتها هنا -->
    </div>

    <footer>
        &copy; 2024 URL Management System
    </footer>

    <script>
document.addEventListener('DOMContentLoaded', function () {
  const addUrlForm = document.getElementById('add-url-form');
  const deleteUrlForm = document.getElementById('delete-url-form');
  const resultsDiv = document.getElementById('results');
  const pthMain = document.getElementById('pth');


  // وظيفة لإضافة URL
  addUrlForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const path = document.getElementById('add-path').value;
    const url = document.getElementById('add-url').value;

    fetch('/add-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path, url }),
    })
    .then(response => {
      displayMessage('URL added successfully');
      addUrlForm.reset();
pthMain.innerHTML = '<br><a href="/' + path + '" class="button" target="_blank">Link</a>'
    })
    .catch(error => {
      displayMessage('Error adding URL');
      console.error('Error:', error);
      addUrlForm.reset();
    });
  });

  // وظيفة لحذف URL
  deleteUrlForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const path = document.getElementById('delete-path').value;

    fetch('/delete-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    })
    .then(response => {
      displayMessage('URL deleted successfully');
      deleteUrlForm.reset();
    })
    .catch(error => {
      displayMessage('Error deleting URL');
      console.error('Error:', error);
      deleteUrlForm.reset();
    });
  });

  // عرض الرسائل في div#results
  function displayMessage(message) {
    resultsDiv.innerHTML = '<p>' + message + '</p>'
  }
});
</script>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f9;
  color: #333;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
}

h2 {
  margin-top: 20px;
  color: #34495e;
}

form {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
  color: #34495e;
}

input[type="text"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}

.container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

form h2 {
  margin-bottom: 15px;
  font-size: 20px;
}

footer {
  text-align: center;
  margin-top: 30px;
  color: #7f8c8d;
}

#results {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 600px) {
  form {
    max-width: 90%;
  }
}

/* تنسيق الرابط كزر */
.button {
    display: inline-block;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    text-decoration: none;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s, box-shadow 0.3s;
}

.button:hover {
    background-color: #0056b3;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.button:active {
    background-color: #004494;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

</style>
</body>
</html>
`;
  res.send(html);
});

app.get('/get-urls', (req, res) => {
  const urls = readDatabase();
  res.json(urls);
});

// إضافة رابط جديد (POST)
app.post('/add-url', (req, res) => {
  const { path: urlPath, url } = req.body;

  // قراءة البيانات الحالية
  const urls = readDatabase();

  // التحقق إذا كان الرابط بالفعل موجود
  const existingUrl = urls.find((u) => u.path === urlPath);
  if (existingUrl) {
    return res.status(400).json({ message: 'URL with this path already exists.' });
  }

  // إضافة الرابط الجديد
  urls.push({ path: urlPath, url });
  writeDatabase(urls);
  res.redirect('/');  // إعادة توجيه المستخدم إلى الصفحة الرئيسية بعد الإضافة
});

// حذف رابط موجود (POST)
app.post('/delete-url', (req, res) => {
  const { path: urlPath } = req.body;

  // قراءة البيانات الحالية
  const urls = readDatabase();

  // تصفية الروابط وإزالة الرابط الذي يحتوي على المسار المطلوب
  const updatedUrls = urls.filter((u) => u.path !== urlPath);

  if (urls.length === updatedUrls.length) {
    return res.status(404).json({ message: 'URL not found.' });
  }

  // تحديث قاعدة البيانات
  writeDatabase(updatedUrls);
  res.redirect('/');  // إعادة توجيه المستخدم إلى الصفحة الرئيسية بعد الحذف
});

// توجيه الطلبات عبر البروكسي باستخدام الـ path الديناميكي
app.use('/:path', (req, res) => {
  const { path: urlPath } = req.params;

  // قراءة البيانات الحالية
  const urls = readDatabase();

  // البحث عن الرابط المطلوب
  const target = urls.find((u) => u.path === urlPath);

  if (target) {
    // استخدام البروكسي لتحويل الطلب إلى الرابط الهدف
    proxy.web(req, res, { target: target.url }, (err) => {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error.');
    });
  } else {
    res.status(404).send('URL not found.');
  }
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log('Proxy server is running on port '+PORT);
});
    
