const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const dbConfig = {
  server: 'localhost\\SQLEXPRESS',
  database: 'BharatStyleWomenDB',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function startServer() {
  try {
    await sql.connect(dbConfig);
    console.log('Connected to SQL Server 2025 Local Instance successfully!');
  } catch (err) {
    console.error('SQL Server connection failed:', err);
  }

  // 1. Sign In
  app.post('/api/signin', async (req, res) => {
    try {
      const { identifier, password } = req.body;
      const pool = await sql.connect(dbConfig);

      const result = await pool.request()
        .input('identifier', sql.VarChar, identifier)
        .query(`
          SELECT c.*, ISNULL(r.role_name, c.role) AS assigned_role
          FROM confidential_consumers c
          LEFT JOIN user_roles r ON c.identifier = r.identifier
          WHERE c.identifier = @identifier OR c.mobile = @identifier
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      const user = result.recordset[0];
      if (user.password !== password) {
        return res.status(401).json({ success: false, error: 'Incorrect password.' });
      }

      res.json({
        success: true,
        user: {
          name: user.name,
          identifier: user.identifier,
          mobile: user.mobile,
          role: user.assigned_role || 'customer'
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Products
  app.get('/api/products', async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM products');
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const { p, userRole, userEmail } = req.body;
      const pool = await sql.connect(dbConfig);

      if (userRole === 'store_operator') {
        await pool.request()
          .input('id', sql.VarChar, p.id)
          .input('brand', sql.VarChar, p.brand)
          .input('name', sql.NVarChar, p.name)
          .input('style', sql.VarChar, p.style)
          .input('price', sql.Int, p.price)
          .input('mrp', sql.Int, p.mrp)
          .input('image', sql.NVarChar, p.image)
          .input('email', sql.VarChar, userEmail)
          .query(`
            INSERT INTO product_approvals (product_id, brand, name, style, price, mrp, image, submitted_by, status)
            VALUES (@id, @brand, @name, @style, @price, @mrp, @image, @email, 'Pending')
          `);
        return res.json({ success: true, pendingApproval: true });
      }

      await pool.request()
        .input('id', sql.VarChar, p.id)
        .input('brand', sql.VarChar, p.brand)
        .input('name', sql.NVarChar, p.name)
        .input('style', sql.VarChar, p.style)
        .input('price', sql.Int, p.price)
        .input('mrp', sql.Int, p.mrp)
        .input('image', sql.NVarChar, p.image)
        .query(`
          MERGE INTO products AS target
          USING (SELECT @id AS id) AS source (id)
          ON target.id = source.id
          WHEN MATCHED THEN
            UPDATE SET brand = @brand, name = @name, style = @style, price = @price, mrp = @mrp, image = @image
          WHEN NOT MATCHED THEN
            INSERT (id, brand, name, style, price, mrp, rating, reviews, image, inStock)
            VALUES (@id, @brand, @name, @style, @price, @mrp, 4.8, 15, @image, 1);
        `);
      res.json({ success: true, pendingApproval: false });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Coupons Endpoints
  app.get('/api/coupons', async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM coupons');
      const couponsObj = {};
      result.recordset.forEach(c => {
        couponsObj[c.code] = {
          type: c.type,
          value: c.value,
          minOrder: c.minOrder,
          maxDiscount: c.maxDiscount,
          description: c.description
        };
      });
      res.json(couponsObj);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/coupons', async (req, res) => {
    try {
      const { code, type, value, minOrder, maxDiscount, description } = req.body;
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input('code', sql.VarChar, code)
        .input('type', sql.VarChar, type)
        .input('value', sql.Int, value)
        .input('minOrder', sql.Int, minOrder || 999)
        .input('maxDiscount', sql.Int, maxDiscount || 1500)
        .input('description', sql.NVarChar, description)
        .query(`
          MERGE INTO coupons AS target
          USING (SELECT @code AS code) AS source (code)
          ON target.code = source.code
          WHEN MATCHED THEN
            UPDATE SET type = @type, value = @value, minOrder = @minOrder, maxDiscount = @maxDiscount, description = @description
          WHEN NOT MATCHED THEN
            INSERT (code, type, value, minOrder, maxDiscount, description)
            VALUES (@code, @type, @value, @minOrder, @maxDiscount, @description);
        `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/coupons/:code', async (req, res) => {
    try {
      const code = req.params.code;
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input('code', sql.VarChar, code)
        .query('DELETE FROM coupons WHERE code = @code');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Site Config (Banner & Fees) Endpoints
  app.get('/api/config', async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM site_config WHERE id = 1');
      if (result.recordset.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.json({ promoBannerText: "🌸 WOMEN'S FESTIVE ROSE EDIT: Flat 20% OFF | Code: ROSE20", platformFee: 20, freeShippingThreshold: 999 });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/config', async (req, res) => {
    try {
      const { promoBannerText, platformFee, freeShippingThreshold } = req.body;
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input('banner', sql.NVarChar, promoBannerText)
        .input('fee', sql.Int, platformFee)
        .input('ship', sql.Int, freeShippingThreshold)
        .query(`
          MERGE INTO site_config AS target
          USING (SELECT 1 AS id) AS source (id)
          ON target.id = source.id
          WHEN MATCHED THEN
            UPDATE SET promoBannerText = @banner, platformFee = @fee, freeShippingThreshold = @ship
          WHEN NOT MATCHED THEN
            INSERT (id, promoBannerText, platformFee, freeShippingThreshold)
            VALUES (1, @banner, @fee, @ship);
        `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Operator Management Endpoints (Admin Only)
  app.get('/api/operators', async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(`
        SELECT c.identifier, c.name, c.mobile, r.role_name 
        FROM confidential_consumers c
        JOIN user_roles r ON c.identifier = r.identifier
        WHERE r.role_name = 'store_operator'
      `);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/operators', async (req, res) => {
    try {
      const { email, name, mobile, password, allowedTabs } = req.body;
      const pool = await sql.connect(dbConfig);
      const tabsStr = Array.isArray(allowedTabs) ? allowedTabs.join(',') : 'rates,new-product';

      await pool.request()
        .input('email', sql.VarChar, email)
        .input('name', sql.VarChar, name)
        .input('mobile', sql.VarChar, mobile)
        .input('password', sql.VarChar, password)
        .input('tabs', sql.VarChar, tabsStr)
        .query(`
          MERGE INTO confidential_consumers AS target
          USING (SELECT @email AS identifier) AS source (identifier)
          ON target.identifier = source.identifier
          WHEN MATCHED THEN
            UPDATE SET name = @name, mobile = @mobile, [password] = @password, role = 'store_operator'
          WHEN NOT MATCHED THEN
            INSERT (identifier, name, mobile, [password], role, lastActive)
            VALUES (@email, @name, @mobile, @password, 'store_operator', GETDATE());

          MERGE INTO user_roles AS target
          USING (SELECT @email AS identifier) AS source (identifier)
          ON target.identifier = source.identifier
          WHEN MATCHED THEN UPDATE SET role_name = 'store_operator'
          WHEN NOT MATCHED THEN INSERT (identifier, role_name, status) VALUES (@email, 'store_operator', 'active');

          MERGE INTO operator_permissions AS target
          USING (SELECT @email AS identifier) AS source (identifier)
          ON target.identifier = source.identifier
          WHEN MATCHED THEN UPDATE SET allowed_tabs = @tabs
          WHEN NOT MATCHED THEN INSERT (identifier, allowed_tabs) VALUES (@email, @tabs);
        `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/operators/:email', async (req, res) => {
    try {
      const email = req.params.email;
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input('email', sql.VarChar, email)
        .query(`
          DELETE FROM user_roles WHERE identifier = @email;
          DELETE FROM confidential_consumers WHERE identifier = @email;
        `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Approval Queue Endpoints
  app.get('/api/approvals', async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("SELECT * FROM product_approvals WHERE status = 'Pending'");
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/approvals/action', async (req, res) => {
    try {
      const { approvalId, action } = req.body;
      const pool = await sql.connect(dbConfig);

      if (action === 'Approved') {
        const itemReq = await pool.request()
          .input('aid', sql.Int, approvalId)
          .query('SELECT * FROM product_approvals WHERE approval_id = @aid');
        
        if (itemReq.recordset.length > 0) {
          const item = itemReq.recordset[0];
          await pool.request()
            .input('id', sql.VarChar, item.product_id)
            .input('brand', sql.VarChar, item.brand)
            .input('name', sql.NVarChar, item.name)
            .input('style', sql.VarChar, item.style)
            .input('price', sql.Int, item.price)
            .input('mrp', sql.Int, item.mrp)
            .input('image', sql.NVarChar, item.image)
            .query(`
              MERGE INTO products AS target
              USING (SELECT @id AS id) AS source (id)
              ON target.id = source.id
              WHEN MATCHED THEN
                UPDATE SET brand = @brand, name = @name, style = @style, price = @price, mrp = @mrp, image = @image
              WHEN NOT MATCHED THEN
                INSERT (id, brand, name, style, price, mrp, rating, reviews, image, inStock)
                VALUES (@id, @brand, @name, @style, @price, @mrp, 4.8, 15, @image, 1);
            `);
        }
      }

      await pool.request()
        .input('aid', sql.Int, approvalId)
        .input('status', sql.VarChar, action)
        .query('UPDATE product_approvals SET status = @status WHERE approval_id = @aid');

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1. Get Operator Permissions
   app.get('/api/operators/permissions/:email', async (req, res) => {
     try {
       const email = req.params.email;
       const pool = await sql.connect(dbConfig);
       const result = await pool.request()
         .input('email', sql.VarChar, email)
         .query('SELECT allowed_tabs FROM operator_permissions WHERE identifier = @email');
       
       if (result.recordset.length > 0) {
         res.json({ allowedTabs: result.recordset[0].allowed_tabs.split(',') });
       } else {
         res.json({ allowedTabs: ['rates', 'new-product'] }); // Default operator tabs
       }
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
   });

   // 2. Save Operator Permissions (Admin Only)
   app.post('/api/operators/permissions', async (req, res) => {
     try {
       const { email, allowedTabs } = req.body;
       const pool = await sql.connect(dbConfig);
       const tabsStr = Array.isArray(allowedTabs) ? allowedTabs.join(',') : allowedTabs;

       await pool.request()
         .input('email', sql.VarChar, email)
         .input('tabs', sql.VarChar, tabsStr)
         .query(`
           MERGE INTO operator_permissions AS target
           USING (SELECT @email AS identifier) AS source (identifier)
           ON target.identifier = source.identifier
           WHEN MATCHED THEN UPDATE SET allowed_tabs = @tabs
           WHEN NOT MATCHED THEN INSERT (identifier, allowed_tabs) VALUES (@email, @tabs);
         `);
       res.json({ success: true });
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
   });

   // 3. Save Payment Transaction Details
   app.post('/api/payments', async (req, res) => {
     try {
       const { transactionId, orderId, customerIdentifier, amount, paymentMode } = req.body;
       const pool = await sql.connect(dbConfig);
       await pool.request()
         .input('txId', sql.VarChar, transactionId)
         .input('ordId', sql.VarChar, orderId)
         .input('cust', sql.VarChar, customerIdentifier)
         .input('amt', sql.Int, amount)
         .input('mode', sql.VarChar, paymentMode)
         .query(`
           INSERT INTO payment_transactions (transaction_id, order_id, customer_identifier, amount, payment_mode)
           VALUES (@txId, @ordId, @cust, @amt, @mode)
         `);
       res.json({ success: true });
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
   });

   // 4. Get All Registered Customers (For Bulk Email / WhatsApp)
   app.get('/api/customers/contacts', async (req, res) => {
     try {
       const pool = await sql.connect(dbConfig);
       const result = await pool.request().query('SELECT identifier, name, mobile FROM confidential_consumers WHERE role = \'customer\'');
       res.json(result.recordset);
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
   });

  app.listen(3000, () => {
    console.log('SQL Server Bridge running on http://localhost:3000');
  });
}

startServer();