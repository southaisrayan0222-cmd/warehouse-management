import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

// Authentication State
  isLoggedIn: boolean = false;
  loginIdentifier: string = '';
  loginPassword: string = '';

// Navigation tab state
  activeTab: string = 'dashboard';

  // 1. Inward Entry Data
  paperMill = '';
  paperGsm: number | null = null;
  paperWidth: number | null = null;
  paperQuantity: number | null = null;
  paperUnit = 'Tons';

  adhesiveQuantityKg: number | null = null;

  stockTable: any[] = [
    { type: 'Paper', mill: 'TNPL', gsm: 120, width: 100, quantity: 15, unit: 'Tons' },
    { type: 'Paper', mill: 'JK Paper', gsm: 150, width: 120, quantity: 8, unit: 'Tons' },
    { type: 'Adhesive', mill: 'Pidilite', gsm: '-', width: '-', quantity: 500, unit: 'KG' }
  ];

  // 2. Order Entry Data
  orderCustomer = '';
  orderSource = '';
  productId = '';
  outerDiameter: number | null = null;
  thickness: number | null = null;
  orderQuantity: number | null = null;
  orderUnit = 'Tons';
  
  convertedQuantity: string = '';
  feasibilityMessage: string = '';
  feasibilityClass: string = '';

  ordersList: any[] = [
    { id: 'ORD-001', customer: 'Apex Packaging', source: 'Direct', product: 'Core-A1', quantity: 3, unit: 'Tons', status: 'Pending' }
  ];

  // 3. Dispatch Data
  selectedOrderForDispatch: any = null;
  lorryNo = '';
  lorryCapacity: number | null = null;
  dispatchLocation = '';
  dispatchMessage = '';
  dispatchSuccess = false;


  // Authentication Methods
  onLogin() {
    if (this.loginIdentifier.trim() && this.loginPassword.trim()) {
      this.isLoggedIn = true;
      this.activeTab = 'dashboard';
    } else {
      alert('Please enter your Mobile/Email and Password.');
    }
  }

  onGoogleLogin() {
    this.isLoggedIn = true;
    this.activeTab = 'dashboard';
  }

  logout() {
    this.isLoggedIn = false;
    this.loginIdentifier = '';
    this.loginPassword = '';
    this.activeTab = 'dashboard';
  }

  // Methods for Inward Entry
  addPaperStock() {
    if (this.paperMill && this.paperGsm && this.paperWidth && this.paperQuantity) {
      this.stockTable.push({
        type: 'Paper',
        mill: this.paperMill,
        gsm: this.paperGsm,
        width: this.paperWidth,
        quantity: this.paperQuantity,
        unit: this.paperUnit
      });
      this.paperMill = '';
      this.paperGsm = null;
      this.paperWidth = null;
      this.paperQuantity = null;
      alert('Paper stock successfully added!');
    } else {
      alert('Please fill out all paper stock fields.');
    }
  }

  addAdhesiveStock() {
    if (this.adhesiveQuantityKg) {
      this.stockTable.push({
        type: 'Adhesive',
        mill: 'Standard Supplier',
        gsm: '-',
        width: '-',
        quantity: this.adhesiveQuantityKg,
        unit: 'KG'
      });
      this.adhesiveQuantityKg = null;
      alert('Adhesive stock successfully added in KG!');
    } else {
      alert('Please enter adhesive quantity in KG.');
    }
  }

  // Methods for Order Entry & Conversion
  onOrderQuantityChange() {
    if (this.orderQuantity !== null) {
      if (this.orderUnit === 'Tons') {
        const kg = this.orderQuantity * 1000;
        this.convertedQuantity = `${this.orderQuantity} Tons = ${kg} KG`;
      } else {
        const tons = this.orderQuantity / 1000;
        this.convertedQuantity = `${this.orderQuantity} KG = ${tons} Tons`;
      }
    } else {
      this.convertedQuantity = '';
    }
  }

  checkFeasibility() {
    if (!this.orderQuantity) {
      this.feasibilityMessage = 'Please enter an order quantity first.';
      this.feasibilityClass = 'alert-warning';
      return;
    }
    // Calculate total available paper stock in Tons
    let totalPaperTons = this.stockTable
      .filter(s => s.type === 'Paper')
      .reduce((acc, curr) => {
        let qtyInTons = curr.unit === 'Tons' ? curr.quantity : curr.quantity / 1000;
        return acc + qtyInTons;
      }, 0);

    let requiredTons = this.orderUnit === 'Tons' ? this.orderQuantity : this.orderQuantity / 1000;

    if (totalPaperTons >= requiredTons) {
      this.feasibilityMessage = `Feasible! Sufficient raw material available (${totalPaperTons} Tons in stock).`;
      this.feasibilityClass = 'alert-success';
    } else {
      this.feasibilityMessage = `Not Feasible! Insufficient stock. Required: ${requiredTons} Tons, Available: ${totalPaperTons} Tons.`;
      this.feasibilityClass = 'alert-danger';
    }
  }

  createOrder() {
    if (this.orderCustomer && this.productId && this.orderQuantity) {
      const newOrder = {
        id: `ORD-00${this.ordersList.length + 1}`,
        customer: this.orderCustomer,
        source: this.orderSource || 'Direct',
        product: this.productId,
        quantity: this.orderQuantity,
        unit: this.orderUnit,
        status: 'Pending'
      };
      this.ordersList.push(newOrder);
      alert('Order created successfully!');
      this.orderCustomer = '';
      this.productId = '';
      this.orderQuantity = null;
      this.convertedQuantity = '';
    } else {
      alert('Please fill in required order details.');
    }
  }

  // Methods for Dispatch Module
  processDispatch() {
    if (!this.selectedOrderForDispatch || !this.lorryNo || !this.lorryCapacity || !this.dispatchLocation) {
      this.dispatchMessage = 'Please fill all dispatch fields and select an order.';
      this.dispatchSuccess = false;
      return;
    }

    // Convert order quantity to tons for comparison
    let orderWeightTons = this.selectedOrderForDispatch.unit === 'Tons' 
      ? this.selectedOrderForDispatch.quantity 
      : this.selectedOrderForDispatch.quantity / 1000;

    if (orderWeightTons > this.lorryCapacity) {
      this.dispatchMessage = `Dispatch Blocked: Order weight (${orderWeightTons} Tons) exceeds lorry capacity (${this.lorryCapacity} Tons)!`;
      this.dispatchSuccess = false;
    } else {
      this.dispatchMessage = `Dispatch Successful! Order ${this.selectedOrderForDispatch.id} loaded onto Lorry ${this.lorryNo} for ${this.dispatchLocation}. (No partial dispatch allowed - Full order dispatched).`;
      this.dispatchSuccess = true;
      this.selectedOrderForDispatch.status = 'Dispatched';
    }
  }}
