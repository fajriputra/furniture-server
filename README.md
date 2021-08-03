# furniture-server
 
baseUrl = https://server-furniture.herokuapp.com
 
LIST API = [{

  products: {
  - api/products (post)
  - api/products (get) -- include filter by keyword, pagination, categories[array], tags[array]
  - api/products/:id (put)
  - api/products/:id (delete)
  }

  categories: {
  - api/categories (post)
  - api/categories (get)
  - api/categories/:id (put)
  - api/categories/:id (delete)
  }

  tag: {
  - api/tag (post)
  - api/tag (get)
  - api/tag/:id (put)
  - api/tag/:id (delete)
  }

  auth: {
  - auth/register (post)
  - auth/login (post)
  - auth/me (get)
  - auth/logout (post)
  }

  wilayah: {
  - api/wilayah/provinsi (get) -- select dropdown
  - api/wilayah/kabupaten (get) -- select dropdown
  - api/wilayah/kecamatan (get) -- select dropdown
  - api/wilayah/desa (get) -- select dropdown
  }

  delivery-address: {
  - api/delivery-address (post) 
  - api/delivery-address (get)
  - api/delivery-address/:id (put)
  - api/delivery-address/:id (delete)
  }

  carts: {
  - api/carts (get) -- berdasarkan items dari user yang sedang login
  - api/carts (put) -- update / increment - decrement product qty
  }

  orders: {
  - api/orders (post) -- order items dari carts berdasarkan user yang sedang login
  - api/orders (get) -- mengambil data order items terkait orders (-- pagination)
  }

  invoices: {
  - api/invoices/:order_id (get) 
  - api/invoices/:order_id/initiate-payment (get)
  - -- data invoices berdasarkan order id 
  - -- mengambil data order terkait invoices 
  - -- mengambil data user terkait invoices
  }
  
}]
