import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosClient from '../configs/axiosClient';
import { message } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ISupplier {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    email: string;
    phoneNumber: string;
    birthday: string;
}

interface IFormInput {
    birthday: string;
    email: string;
    address: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
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

    const [employees, setEmployees] = useState<ISupplier[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get('/online-shop/employees', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                setEmployees(response.data);
            } catch (err: any) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (selectedId !== null) {
                const response = await axiosClient.patch(`/online-shop/employees/${selectedId}`, data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 200) {
                    message.success('Cập nhật thành công');
                    setEmployees((prevEmployees) =>
                        prevEmployees.map((employee) =>
                            employee.id === selectedId ? { ...employee, ...data } : employee
                        )
                    );
                    setSelectedId(null);
                    handleResetForm();
                }
            } else {
                const response = await axiosClient.post('/online-shop/employees', data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 201) {
                    message.success('Thêm mới thành công');
                    setEmployees((prevEmployees) => [...prevEmployees, response.data]);
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

    const onDelete = async (employeeId: number) => {
        try {
            const response = await axiosClient.delete(`/online-shop/employees/${employeeId}`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            if (response.status === 204) {
                message.success('Xóa thành công');
                setEmployees((prevEmployees) =>
                    prevEmployees.filter((employee) => employee.id !== employeeId)
                );
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    return (
        <div >
            <h1>{selectedId !== null ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h1>


            <div className="mt-2">
                <button
                    type="button"
                    className="btn btn-success ms-2"
                    onClick={() => {
                        setIsFormVisible(true);
                        setSelectedId(null);
                        setValue('firstName', '');
                        setValue('lastName', '');
                        setValue('email', '');
                        setValue('address', '');
                        setValue('phoneNumber', '');
                        setValue('birthday', '');
                    }}
                >
                    Thêm
                </button>
                <hr />
            </div>

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
                            className="form-control"
                            placeholder="Nhập ngày sinh"
                        />
                        <span className="text-danger">{errors.birthday?.message}</span>
                    </div>

                    <div className="mt-2">
                        <button type="submit" className="btn btn-danger" onSubmit={handleSubmit(onSubmit)}>
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
                            <th>Địa chỉ</th>
                            <th>Số điện thoại</th>
                            <th>Ngày sinh</th>
                            <th>Địa chỉ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee: ISupplier, index: number) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{employee.id}</td>
                                <td>{employee.firstName}</td>
                                <td>{employee.lastName}</td>
                                <td>{employee.address}</td>
                                <td>{employee.phoneNumber}</td>
                                <td>{employee.birthday}</td>
                                <td>

                                    <button
                                        type="button"
                                        className="btn btn-warning ms-2"
                                        onClick={() => {
                                            setIsFormVisible(true);
                                            setSelectedId(employee.id);
                                            setValue('firstName', employee.firstName);
                                            setValue('lastName', employee.lastName);
                                            setValue('email', employee.email);
                                            setValue('address', employee.address);
                                            setValue('phoneNumber', employee.phoneNumber);
                                            setValue('birthday', employee.birthday);
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger ms-2"
                                        onClick={() => onDelete(employee.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                {/* Modal */}
            </div>
        </div>
    );
};

export default InsertDataWithAxios;
