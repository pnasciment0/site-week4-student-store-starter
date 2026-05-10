We're going to need models for products, orders, and order_items.

Products model will describe products available for purchase in the store.
Should include:
- id (primary key, auto-increment, int)
- name (string)
- description (string)
- price (float)
- image_url (string, optional)
- category (enum)

Then we'll need an Order model.
- order_id (primary key, auto-increment, int)
- customer_id (int, placeholder)
- total_price (float)
- status (enum)
- created_at (datetime)

Finaly we'll need a model for OrderItems. that is, items (products) contained within the order.

- order_item_id (primary key, auto-increment, int)
- order_id (foreign key to Orders)
- product_id (foreign key to Products)
- quantity (int)
- price (float)
OrderItems should also cascade delete i.e. if an Order is deleted, any OrderItems referencing it should also be deleted. Same with Products.

=====

We will also need these endpoints.

Product Endpoints:

    GET /products: Fetch a list of all products.
       - Request shape: No body fields, route params, or query params. 
       - Query parameters: it should support optional filtering and sorting. i.e. category?=clothing only returns Products of Clothing category, ?sort=name or sort=price should return the list sorted from A to Z or highest to lowest. If parameters are given the default response is unfiltered and unsorted.
       - Success response: should return a list of all product objects.
       - Failure response: should return body shape with two fields, status code (400) and error message.
    GET /products/:id: Fetch details of a specific product by its ID.
        - Request shape: Route parameter of the product id.
        - Success response: should return one Product object with all of its associated fields.
        - Failure response: should return body shape with two fields, status code (400) and error message
    POST /products: Add a new product to the database.
        - Request shape: Body fields with each of the fields needed for a new Product (name, description, price, image_url, category)
        - Success response: should return one Product object with newly created Product, including its ID.
        - Failure response: should return body shape with two fields, status code (400) and error message
    PUT /products/:id: Update the details of an existing product.
        - Request shape: Body fields with the new fields to be updated and their new values. Route parameter of the ID of the product that is to be updated.
        - Success response: should return a Product object with the newly updated Product, including all fields.
        - Failure response: should return body shape with two fields, status code (400) and error message
    DELETE /products/:id: Remove a product from the database.
        - Request shape: ID of the product that is to be removed from the database.
        - Success response: should return a simple body shape with a success message and maybe the ID of the successfully deleted Product.
        - Failure response: should return body shape with two fields, status code (400) and error message

Order Endpoints:

    GET /orders: Fetch a list of all orders.
        - Request shape: no body fields, route parameters, or query parameters.
        - Success response: should return a list of all Order objects.
        - failure response: should return body shape with two fields, status code (400) and error message
    GET /orders/:order_id: Fetch details of a specific order by its ID, including the order items.
        - Request shape: Route parameter of the Order ID.
        - Success response: should return the individual Order object with that ID.
        - Failure response: should return body shape with two fields, status code (400) and error message
    POST /orders: Create a new order with specified order items.
        - Request shape: body fields include both Order metadata (customer ID/info, status) and an array of order items to create. 
        - Success response: the object of the newly created Order, along with a list of its associated OrderItem objects.
        - Failure response: should return body shape with two fields, status code (400) and error message
    PUT /orders/:order_id: Update the details of an existing order (e.g., change status).
        - Request shape: body fields include the Order metadata field to update and its value. Route parameter includes the Order ID to update.
        - Success response: should return the Order object that has been updated. 
        - Failure response: should return body shape with two fields, status code (400) and error message
    DELETE /orders/:order_id: Remove an order from the database
        - Request shape: route parameter includes the order ID to be deleted. THIS ENDPOINT SHOULD ALSO CASCADE DELETE THE ORDERITEMS.
        - Success response: should return a simple body shape with a success message and maybe the ID of the successfully deleted Order. 
        - Failure response: should return body shape with two fields, status code (400) and error message

When POST /orders is called, the application should first create an Order record. Then it should create multiple OrderItem records, using the body fields for the data, and linking each new record to the new order. It should then calculate and store the total price for the Order based on the price & quantity of each of the OrderItems. All of this should be done atomically - if there is an error anywhere in this process, the entire operation should rollback.