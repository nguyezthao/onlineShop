import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosClient from '../configs/axiosClient';
import { message } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ISupplier {
    id: number;
    name: string;
    email: string;
    address: string;
    phoneNumber: string;
}

interface IFormInput {
    name: string;
    email: string;
    address: string;
    phoneNumber: string;
}

const schema = yup.object().shape({
    name: yup.string().required('Tên nhà cung cấp không được bỏ trống'),
    email: yup.string().email('Email không hợp lệ').required('Email không được bỏ trống'),
    address: yup.string().required('Địa chỉ không được bỏ trống'),
    phoneNumber: yup.string().required('Số điện thoại không được bỏ trống'),
});

const InsertDataWithAxios: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<IFormInput>({
        resolver: yupResolver(schema),
    });

    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get('/online-shop/suppliers', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                setSuppliers(response.data);
            } catch (err: any) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (selectedId !== null) {
                const response = await axiosClient.patch(`/online-shop/suppliers/${selectedId}`, data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 200) {
                    message.success('Cập nhật thành công');
                    setSuppliers((prevSuppliers) =>
                        prevSuppliers.map((supplier) =>
                            supplier.id === selectedId ? { ...supplier, ...data } : supplier
                        )
                    );
                    setSelectedId(null);
                    handleResetForm();
                }
            } else {
                const response = await axiosClient.post('/online-shop/suppliers', data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 201) {
                    message.success('Thêm mới thành công');
                    setSuppliers((prevSuppliers) => [...prevSuppliers, response.data]);
                    handleResetForm();
                }
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    const handleResetForm = () => {
        setSelectedId(null);
        setValue('name', '');
        setValue('email', '');
        setValue('address', '');
        setValue('phoneNumber', '');
        setIsFormVisible(false);
    };

    const onDelete = async (supplierId: number) => {
        try {
            const response = await axiosClient.delete(`/online-shop/suppliers/${supplierId}`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            if (response.status === 204) {
                message.success('Xóa thành công');
                setSuppliers((prevSuppliers) =>
                    prevSuppliers.filter((supplier) => supplier.id !== supplierId)
                );
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    return (
        <div className="table-responsive">
            <h1>{selectedId !== null ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}</h1>

            <div className="mt-2">
                <button
                    type="button"
                    className="btn btn-success ms-2"
                    onClick={() => setIsFormVisible(true)}
                >
                    Thêm
                </button>
            </div>
            <hr />

            {isFormVisible && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-2">
                        <label htmlFor="name" className="form-label text-light fs-4">
                            Tên nhà cung cấp
                        </label>
                        <input
                            {...register('name')}
                            id="name"
                            className="form-control"
                            placeholder="Nhập tên nhà cung cấp"
                        />
                        <span className="text-danger">{errors.name?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="email" className="form-label text-light fs-4">
                            Email
                        </label>
                        <input
                            {...register('email')}
                            id="email"
                            className="form-control"
                            placeholder="Nhập địa chỉ email"
                        />
                        <span className="text-danger">{errors.email?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="address" className="form-label text-light fs-4">
                            Địa chỉ
                        </label>
                        <input
                            {...register('address')}
                            id="address"
                            className="form-control"
                            placeholder="Nhập địa chỉ"
                        />
                        <span className="text-danger">{errors.address?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="phoneNumber" className="form-label text-light fs-4">
                            Số điện thoại
                        </label>
                        <input
                            {...register('phoneNumber')}
                            id="phoneNumber"
                            className="form-control"
                            placeholder="Nhập số điện thoại"
                        />
                        <span className="text-danger">{errors.phoneNumber?.message}</span>
                    </div>

                    <div className="mt-2">
                        <button type="submit" className="btn btn-danger">
                            Đồng ý
                        </button>
                    </div>
                </form>
            )}

            <div className="table-responsive">
                <table className="table table-striped table-success table-bordered table-hover">
                    <thead className="thead-success">
                        <tr>
                            <th>STT</th>
                            <th>Tên nhà cung cấp</th>
                            <th>Email</th>
                            <th>Địa chỉ</th>
                            <th>Số điện thoại</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((supplier: ISupplier, index: number) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{supplier.name}</td>
                                <td>{supplier.email}</td>
                                <td>{supplier.address}</td>
                                <td>{supplier.phoneNumber}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-warning ms-2"
                                        onClick={() => {
                                            setIsFormVisible(true);
                                            setSelectedId(supplier.id);
                                            setValue('name', supplier.name);
                                            setValue('email', supplier.email);
                                            setValue('address', supplier.address);
                                            setValue('phoneNumber', supplier.phoneNumber);
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger ms-2"
                                        onClick={() => onDelete(supplier.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
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
