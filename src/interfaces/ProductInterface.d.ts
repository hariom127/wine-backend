declare namespace ProductInterface {

    export interface ICreateProduct {
        name: string;
        brandId: string;
        shopId: string;
        warehouseId: string;
        category: {
            _id: string;
            name: string;
        }
        packing: string;
        MRP: number;
        purchasePrice: number;
        sellingPrice: number;
        boxQty: number;
        looseQty: number;
        qtyPerBox: number;
    }

    export interface IDeleteProduct {
        id: string;
    }


}