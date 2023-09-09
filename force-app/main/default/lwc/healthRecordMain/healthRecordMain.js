import { LightningElement, track, wire, api } from 'lwc';
import getUniqueUsers from '@salesforce/apex/HealthRecordController.getUniqueUsers';
import { refreshApex } from '@salesforce/apex';

export default class HealthRecord_Main extends LightningElement {
    @track selectedUser = '';
    @track showForm = false;
    @track uniqueUsers = []; 
    @track wiredUniqueUsers;
    @track healthRecordId;

    // Wire the method to fetch unique Users from your Apex class
    @wire(getUniqueUsers)
    wireUniqueUsers(result) {
        this.wiredUniqueUsers = result;
        if (result.data) {
            // Process the data to populate uniqueUsers property
            this.uniqueUsers = result.data;
        } else if (result.error) {
            // Handle error
        }
    }

    // Handle user filter change
    handleUserChange(event) {
        this.selectedUser = event.target.value;
    }

    handleAddHealthRecord() {
        this.showForm = true;
    }

    handleModalToggle(event){
        this.showForm = event.detail;
        this.healthRecordId = '';
    }

    handleRecordSuccess(event) {
        this.handleRefreshData();
    }

    handleEdit(event){
        this.healthRecordId = event.detail;
        this.showForm = true;
    }

    handleDelete(event){
        refreshApex(this.wiredUniqueUsers);
    }

    handleRefreshData(){
        refreshApex(this.wiredUniqueUsers);
        this.refreshDatatTableData();
    }

    refreshDatatTableData(){
        debugger
        const dataTable = this.template.querySelector('[data-id="data-table"]');
        if (dataTable) {
            dataTable.handleRefreshData(); // Call the method in the child component
        }
    }
}