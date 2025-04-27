# Documentation de l’API PrestaShop

Bienvenue dans la documentation de l’API REST de PrestaShop utilisée par l’application Order Management.
Cette API permet d’interagir avec les principales entités de la boutique (commandes, clients, produits, etc.).

---

# Tableau des ressources de l’API PrestaShop

| Ressource                      | URL                                             | Méthodes supportées         | Description                              |
|--------------------------------|-------------------------------------------------|-----------------------------|------------------------------------------|
| addresses                      | /api/addresses                                  | GET                        | The Customer, Manufacturer and Customer addresses |
| carriers                       | /api/carriers                                   | GET                        | The Carriers                             |
| cart_rules                     | /api/cart_rules                                 | GET                        | Cart rules management                    |
| carts                          | /api/carts                                      | GET                        | Customer's carts                         |
| categories                     | /api/categories                                 | GET                        | The product categories                   |
| combinations                   | /api/combinations                               | GET                        | The product combinations                 |
| configurations                 | /api/configurations                             | GET                        | Shop configuration                       |
| contacts                       | /api/contacts                                   | GET                        | Shop contacts                            |
| content_management_system      | /api/content_management_system                  | GET                        | Content management system                |
| countries                      | /api/countries                                  | GET                        | The countries                            |
| currencies                     | /api/currencies                                 | GET                        | The currencies                           |
| customer_messages              | /api/customer_messages                          | GET                        | Customer services messages               |
| customer_threads               | /api/customer_threads                           | GET                        | Customer services threads                |
| customers                      | /api/customers                                  | GET                        | The e-shop's customers                   |
| customizations                 | /api/customizations                             | GET                        | Customization values                     |
| deliveries                     | /api/deliveries                                 | GET                        | Product delivery                         |
| employees                      | /api/employees                                  | GET                        | The Employees                            |
| groups                         | /api/groups                                     | GET                        | The customer's groups                    |
| guests                         | /api/guests                                     | GET                        | The guests                               |
| image_types                    | /api/image_types                                | GET                        | The image types                          |
| images                         | /api/images                                     | GET                        | The images                               |
| languages                      | /api/languages                                  | GET                        | Shop languages                           |
| manufacturers                  | /api/manufacturers                              | GET                        | The product manufacturers                |
| order_carriers                 | /api/order_carriers                             | GET                        | The Order carriers                       |
| order_details                  | /api/order_details                              | GET                        | Details of an order                      |
| order_discounts                | /api/order_discounts                            | GET                        | Discounts of an order                    |
| order_histories                | /api/order_histories                            | GET                        | The Order histories                      |
| order_invoices                 | /api/order_invoices                             | GET                        | The Order invoices                       |
| order_payments                 | /api/order_payments                             | GET                        | The Order payments                       |
| order_slip                     | /api/order_slip                                 | GET                        | The Order slips                          |
| order_states                   | /api/order_states                               | GET                        | The Order statuses                       |
| orders                         | /api/orders                                     | GET                        | The Customers orders                     |
| price_ranges                   | /api/price_ranges                               | GET                        | Price ranges                             |
| product_customization_fields   | /api/product_customization_fields               | GET                        | Customization Field                      |
| product_feature_values         | /api/product_feature_values                     | GET                        | The product feature values               |
| product_features               | /api/product_features                           | GET                        | The product features                     |
| product_option_values          | /api/product_option_values                      | GET                        | The product options value                |
| product_options                | /api/product_options                            | GET                        | The product options                      |
| product_suppliers              | /api/product_suppliers                          | GET                        | Product Suppliers                        |
| products                       | /api/products                                   | GET                        | The products                             |
| search                         | /api/search                                     | GET                        | Search                                   |
| shop_groups                    | /api/shop_groups                                | GET                        | Shop groups from multi-shop feature      |
| shop_urls                      | /api/shop_urls                                  | GET                        | Shop URLs from multi-shop feature        |
| shops                          | /api/shops                                      | GET                        | Shops from multi-shop feature            |
| specific_price_rules           | /api/specific_price_rules                       | GET                        | Specific price management                |
| specific_prices                | /api/specific_prices                            | GET                        | Specific price management                |
| states                         | /api/states                                     | GET                        | The available states of countries        |
| stock_availables               | /api/stock_availables                           | GET                        | Available quantities                     |
| stock_movement_reasons         | /api/stock_movement_reasons                     | GET                        | Stock movement reason                    |
| stock_movements                | /api/stock_movements                            | GET                        | Stock movements                          |
| stocks                         | /api/stocks                                     | GET                        | Stocks                                   |
| stores                         | /api/stores                                     | GET                        | The stores                               |
| suppliers                      | /api/suppliers                                  | GET                        | The product suppliers                    |
| supply_order_details           | /api/supply_order_details                       | GET                        | Supply Order Details                     |
| supply_order_histories         | /api/supply_order_histories                     | GET                        | Supply Order Histories                   |
| supply_order_receipt_histories | /api/supply_order_receipt_histories             | GET                        | Supply Order Receipt Histories           |
| supply_order_states            | /api/supply_order_states                        | GET                        | Supply Order Statuses                    |
| supply_orders                  | /api/supply_orders                              | GET                        | Supply Orders                            |
| tags                           | /api/tags                                       | GET                        | The Products tags                        |
| tax_rule_groups                | /api/tax_rule_groups                            | GET                        | Tax rule groups                          |
| tax_rules                      | /api/tax_rules                                  | GET                        | Tax rules entity                         |
| taxes                          | /api/taxes                                      | GET                        | The tax rate                             |
| translated_configurations      | /api/translated_configurations                  | GET                        | Shop configuration                       |
| warehouse_product_locations    | /api/warehouse_product_locations                | GET                        | Location of products in warehouses       |
| warehouses                     | /api/warehouses                                 | GET                        | Warehouses                               |
| weight_ranges                  | /api/weight_ranges                              | GET                        | Weight ranges                            |
| zones                          | /api/zones                                      | GET                        | The Countries zones                      |

---


## 1. Authentification

Toutes les requêtes nécessitent une clé API. Elle doit être transmise via l’en-tête HTTP `Authorization` ou directement dans l’URL :

```http
GET http://<hôte>/presta16/api/orders?output_format=JSON&ws_key=VOTRE_CLE_API
```

**Format recommandé :**
```http
GET /presta16/api/orders
Authorization: Basic VOTRE_CLE_API
```

---

## 2. Structure des Endpoints

| Ressource         | URL                                      | Méthodes supportées | Description                          |
|-------------------|------------------------------------------|---------------------|--------------------------------------|
| Clients           | /api/customers                           | GET, POST, PUT      | Gestion des clients                  |
| Commandes         | /api/orders                              | GET, POST, PUT      | Gestion des commandes                |
| Produits          | /api/products                            | GET, POST, PUT      | Gestion des produits                 |
| Catégories        | /api/categories                          | GET, POST, PUT      | Gestion des catégories               |
| Stocks            | /api/stock_availables                    | GET, POST, PUT      | Gestion des stocks                   |
| Transporteurs     | /api/carriers                            | GET                 | Liste des transporteurs              |
| Factures          | /api/order_invoices                      | GET                 | Liste des factures                   |
| États de commande | /api/order_states                        | GET                 | Liste des statuts de commande        |

---

## 3. Exemple d’utilisation

### a) Récupérer la liste des commandes
```http
GET http://<hôte>/presta16/api/orders?output_format=JSON&ws_key=VOTRE_CLE_API
```
**Réponse :**
```json
{
  "orders": [
    { "id": 1, "reference": "ABC123", "date_add": "2023-01-01", ... },
    ...
  ]
}
```

### b) Créer un client
```http
POST http://<hôte>/presta16/api/customers?ws_key=VOTRE_CLE_API
Content-Type: application/xml

<customer>
  <firstname>Jean</firstname>
  <lastname>Dupont</lastname>
  <email>jean.dupont@email.com</email>
  ...
</customer>
```

---

## 4. Codes de retour

- `200 OK` : Succès
- `201 Created` : Création réussie
- `400 Bad Request` : Données invalides
- `401 Unauthorized` : Clé API manquante/invalide
- `404 Not Found` : Ressource inexistante

---

## 5. Conseils et remarques

- Pour chaque ressource, vous pouvez ajouter `?schema=blank` ou `?schema=synopsis` à l’URL pour obtenir le schéma XML.
- Le paramètre `output_format=JSON` permet d’obtenir des réponses au format JSON (sinon XML par défaut).
- Les opérations de création/modification doivent être envoyées au format XML.

---

## 6. Liens utiles
- [Documentation officielle PrestaShop Webservice](https://devdocs.prestashop-project.org/1.7/webservice/)
- [Exemples d’utilisation](https://devdocs.prestashop-project.org/1.7/webservice/tutorials/)

---

Pour toute question ou problème, contactez l’administrateur technique de la boutique.

---

*Dernière mise à jour : 24/04/2025*