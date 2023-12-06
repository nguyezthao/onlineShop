import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm, UseFormSetValue } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosClient from '../configs/axiosClient';
import { message } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import Products from './../Products';
import Categories from './../Categories';
interface ICategory {
    id: number;
    name: string;
    description: string;
}

interface ISupplier {
    id: number;
    name: string;
    email: string;
    address: string;
    phoneNumber: string;
}
interface IProducts {
    id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    stock: number;
    categoriesId: number;
    supplierId: number;
    categories: {
        id: number;
        name: string;
        description: string;
    };
    supplier: {
        id: number;
        name: string;
        email: string;
        address: string;
        phoneNumber: string;
    };
}

interface IFormInput {
    name: string;
    price: number;
    discount: number;
    stock: number;
    description: string;
    categoriesId: number;
    supplierId: number;
}

const schema = yup.object().shape({
    name: yup.string().required('Tên không được bỏ trống'),
    price: yup.number().required('Giá không được bỏ trống'),
    discount: yup.number().required('Giảm giá không được bỏ trống'),
    stock: yup.number().required('Số lượng tồn kho không được bỏ trống'),
    description: yup.string().required('Mô tả không được bỏ trống'),
    categoriesId: yup.number().required('ID danh mục không được bỏ trống'),
    supplierId: yup.number().required('ID nhà cung cấp không được bỏ trống'),
});

const InsertDataWithAxios: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue, // <-- Include setValue here
    } = useForm<IFormInput>({
        resolver: yupResolver(schema),
    });

    const [products, setProducts] = useState<IProducts[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseProducts = await axiosClient.get('/online-shop/products', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                const responseCategories = await axiosClient.get('/online-shop/categories');
                const responseSuppliers = await axiosClient.get('/online-shop/suppliers');

                setProducts(responseProducts.data);
                setCategories(responseCategories.data);
                setSuppliers(responseSuppliers.data);
            } catch (err: any) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (selectedId !== null) {
                const response = await axiosClient.patch(
                    `/online-shop/products/${selectedId}`,
                    data,
                    {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                        },
                    }
                );

                if (response.status === 200) {
                    message.success('Cập nhật thành công');
                    setProducts((prevProducts) =>
                        prevProducts.map((product) =>
                            product.id === selectedId ? { ...product, ...data } : product
                        )
                    );
                    setSelectedId(null);
                    handleResetForm();
                }
            } else {
                const response = await axiosClient.post('/online-shop/products', data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 201) {
                    message.success('Thêm mới thành công');
                    setProducts((prevProducts) => [...prevProducts, response.data]);
                    handleResetForm();
                }
            }
        } catch (err: any) {
            console.error('Error:', err);
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    const handleResetForm = () => {
        setSelectedId(null);
        setValue('name', '');
        setValue('price', 0); // or 0 or some default value
        setValue('discount', 0); // or 0 or some default value
        setValue('stock', 0); // or 0 or some default value
        setValue('description', '');
        setValue('categoriesId', 0); // or some default value
        setValue('supplierId', 0); // or some default value
        setIsFormVisible(false);
    };

    const onDelete = async (productId: number) => {
        try {
            const response = await axiosClient.delete(`/online-shop/products/${productId}`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            if (response.status === 204) {
                message.success('Xóa thành công');
                setProducts((prevProducts) =>
                    prevProducts.filter((product) => product.id !== productId)
                );
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }

    };

    return (
        <div>
            <h1>{selectedId !== null ? 'Sửa khách hàng' : 'Thêm khách hàng'}</h1>

            <div className="mt-2">
                <button
                    type="button"
                    className="btn btn-success ms-2"
                    onClick={() => {
                        setIsFormVisible(true);
                        setValue('name', '');
                        setValue('price', 0);
                        setValue('discount', 0);
                        setValue('stock', 0);
                        setValue('description', '');
                        setValue('categoriesId', 0);
                        setValue('supplierId', 0);
                        setSelectedId(null);
                    }}
                >
                    Thêm
                </button>
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-2">
                        <label htmlFor="name" className="form-label text-light fs-4">
                            Tên sản phẩm
                        </label>
                        <input
                            {...register('name')}
                            id="name"
                            className="form-control"
                            placeholder="Nhập tên sản phẩm"
                        />
                        <span className="text-danger">{errors.name?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="price" className="form-label text-light fs-4">
                            Giá sản phẩm
                        </label>
                        <input
                            {...register('price')}
                            type="number"
                            id="price"
                            className="form-control"
                            placeholder="Nhập giá sản phẩm"
                        />
                        <span className="text-danger">{errors.price?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="discount" className="form-label text-light fs-4">
                            Giảm giá
                        </label>
                        <input
                            {...register('discount')}
                            type="number"
                            id="discount"
                            className="form-control"
                            placeholder="Nhập giảm giá"
                        />
                        <span className="text-danger">{errors.discount?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="stock" className="form-label text-light fs-4">
                            Số lượng tồn kho
                        </label>
                        <input
                            {...register('stock')}
                            type="number"
                            id="stock"
                            className="form-control"
                            placeholder="Nhập số lượng tồn kho"
                        />
                        <span className="text-danger">{errors.stock?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="description" className="form-label text-light fs-4">
                            Mô tả sản phẩm
                        </label>
                        <input
                            {...register('description')}
                            id="description"
                            className="form-control"
                            placeholder="Nhập mô tả sản phẩm"
                        />
                        <span className="text-danger">{errors.description?.message}</span>
                    </div>
                    <div className="mb-2">
                        <label htmlFor="categoriesId" className="form-label text-light fs-4">
                            Danh mục
                        </label>
                        <select
                            {...register('categoriesId')}
                            id="categoriesId"
                            className="form-select"
                        >
                            <option value={0}>Chọn danh mục</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.id}
                                </option>
                            ))}
                        </select>
                        <span className="text-danger">{errors.categoriesId?.message}</span>
                        <div className="mb-2">
                            <label htmlFor="supplierId" className="form-label text-light fs-4">
                                Nhà cung cấp
                            </label>
                            <select
                                {...register('supplierId')}
                                id="supplierId"
                                className="form-select"
                            >
                                <option value={0}>Chọn nhà cung cấp</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.id}
                                    </option>
                                ))}
                            </select>
                            <span className="text-danger">{errors.supplierId?.message}</span>
                        </div>
                    </div>




                    <div className="mt-2">
                        <button type="submit" className="btn btn-danger">
                            {selectedId !== null ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            )}

            <div className="table-responsive">
                <table className="table table-striped table-success table-bordered table-hover">
                    <thead className="thead-success">
                        <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Giá</th>
                            <th>Giảm giá</th>
                            <th>Tồn kho</th>
                            <th>Mô tả</th>
                            <th>ID nhà cung cấp</th>
                            <th>ID nhà danh mục</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            products.map((product, index) => {

                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{product.name}</td>
                                        <td>{product.price}</td>
                                        <td>{product.discount}</td>
                                        <td>{product.stock}</td>
                                        <td>{product.description}</td>

                                        <td>{product.supplierId}</td>
                                        <td>{product.categoriesId}</td>

                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-warning ms-2"
                                                onClick={() => {
                                                    setIsFormVisible(true);
                                                    setSelectedId(product.id);
                                                    // Set form values using the 'setValue' function
                                                    setValue('name', product.name);
                                                    setValue('price', product.price);
                                                    setValue('discount', product.discount);
                                                    setValue('stock', product.stock);
                                                    setValue('description', product.description);
                                                    setValue('supplierId', product.supplierId);
                                                }}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger ms-2"
                                                onClick={() => onDelete(product.id)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        }


                    </tbody>

                </table>
            </div>

            <div
                className="modal fade"
                id="exampleModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                {/* Modal */}
            </div>
        </div>
    );
};

export default InsertDataWithAxios;
