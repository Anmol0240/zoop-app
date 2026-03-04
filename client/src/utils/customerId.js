// Generate a unique ID per browser, stored forever in localStorage
export function getCustomerId() {
  let id = localStorage.getItem('zoop_customer_id');
  if (!id) {
    id = 'cust_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('zoop_customer_id', id);
  }
  return id;
}
