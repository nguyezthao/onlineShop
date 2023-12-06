import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosClient from '../configs/axiosClient';
import { message } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ICustomer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phoneNumber: string;
    birthday: string;
}

interface IFormInput {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phoneNumber: string;
    birthday: string;
}

const schema = yup.object().shape({
    firstName: yup.string().required('Họ không được bỏ trống'),
    lastName: yup.string().required('Tên không được bỏ trống'),
    email: yup.string().email('Email không hợp lệ').required('Email không được bỏ trống'),
    address: yup.string().required('Địa chỉ không được bỏ trống'),
    phoneNumber: yup.string().required('Số điện thoại không được bỏ trống'),
    birthday: yup.string().required('Ngày sinh không được bỏ trống'),
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

    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get('/online-shop/customers', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                setCustomers(response.data);
            } catch (err: any) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (selectedId !== null) {
                const response = await axiosClient.patch(`/online-shop/customers/${selectedId}`, data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 200) {
                    message.success('Cập nhật thành công');
                    setCustomers((prevCustomers) =>
                        prevCustomers.map((customer) =>
                            customer.id === selectedId ? { ...customer, ...data } : customer
                        )
                    );
                    setSelectedId(null);
                    handleResetForm();
                }
            } else {
                const response = await axiosClient.post('/online-shop/customers', data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 201) {
                    message.success('Thêm mới thành công');
                    setCustomers((prevCustomers) => [...prevCustomers, response.data]);
                    handleResetForm();
                }
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    const handleResetForm = () => {
        setSelectedId(null);
        setValue('firstName', '');
        setValue('lastName', '');
        setValue('email', '');
        setValue('address', '');
        setValue('phoneNumber', '');
        setValue('birthday', '');
        setIsFormVisible(false);
    };

    const onDelete = async (customerId: number) => {
        try {
            const response = await axiosClient.delete(`/online-shop/customers/${customerId}`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            if (response.status === 204) {
                message.success('Xóa thành công');
                setCustomers((prevCustomers) =>
                    prevCustomers.filter((customer) => customer.id !== customerId)
                );
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    return (
        <div className="table-responsive">
            <h1>{selectedId !== null ? 'Sửa khách hàng' : 'Thêm khách hàng'}</h1>

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
                        <label htmlFor="firstName" className="form-label text-light fs-4">
                            Họ
                        </label>
                        <input
                            {...register('firstName')}
                            id="firstName"
                            className="form-control"
                            placeholder="Nhập họ"
                        />
                        <span className="text-danger">{errors.firstName?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="lastName" className="form-label text-light fs-4">
                            Tên
                        </label>
                        <input
                            {...register('lastName')}
                            id="lastName"
                            className="form-control"
                            placeholder="Nhập tên"
                        />
                        <span className="text-danger">{errors.lastName?.message}</span>
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

                    <div className="mb-2">
                        <label htmlFor="birthday" className="form-label text-light fs-4">
                            Ngày sinh
                        </label>
                        <input
                            {...register('birthday')}
                            id="birthday"
                            type="date"
                            className="form-control"
                            placeholder="Chọn ngày sinh"
                        />
                        <span className="text-danger">{errors.birthday?.message}</span>
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
                            <th>Họ</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Địa chỉ</th>
                            <th>Số điện thoại</th>
                            <th>Ngày sinh</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer: ICustomer, index: number) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{customer.firstName}</td>
                                <td>{customer.lastName}</td>
                                <td>{customer.email}</td>
                                <td>{customer.address}</td>
                                <td>{customer.phoneNumber}</td>
                                <td>{customer.birthday}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-warning ms-2"
                                        onClick={() => {
                                            setIsFormVisible(true);
                                            setSelectedId(customer.id);
                                            setValue('firstName', customer.firstName);
                                            setValue('lastName', customer.lastName);
                                            setValue('email', customer.email);
                                            setValue('address', customer.address);
                                            setValue('phoneNumber', customer.phoneNumber);
                                            setValue('birthday', customer.birthday);
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger ms-2"
                                        onClick={() => onDelete(customer.id)}
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
