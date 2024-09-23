const Labels = {
    status: {
        "active": "Active",
        "inactive": "Inactive",
        "deleted": "Deleted",
    },
    categoryType: {
        "global": "Global",
        "personal": "Personal",
    },
    gender: {
        Male: 'Male',
        Female: 'Female',
        Other: 'Other',
    },
    type: {
        "global": "Global",
        "personal": "Personal",
    },
    transferStage: {
        "fromX": "From-X",
        "depo": "Depot",
        "warehouse": "Warehouse",
        "shop": "Shop",
        "customer": "Customer"
    },
    tag: {
        "cash": "Cash",
        "purchase": "Purchase",
        "sale": "Sale",
        "salary": "Salary",
        "fuel": "Fuel",
        "officeExpense": "Office Expense",
        "rent": "Rent",
        "return": "Return",
        "other": "Other",
    },

    balanceSheetNote: {
        shopProductSale: "Shop product sale",
        shopProductSaleRevert: "Shop product sale item return",
        warehouseProductPurchase: "Warehouse product purchase",
        warehouseProductPurchaseDelete: "Warehouse product return to depot",
        warehouseProductQtyDecrease: "Warehouse product qty decrease",
        warehouseProductQtyIncrease: "Warehouse product qty increase",
    },

    transactionType: {
        credit: "cr",
        debit: "dr"
    }
};

export { Labels }