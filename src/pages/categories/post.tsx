import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosClient from '../configs/axiosClient';
import { message } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';

interface IFormInput {
    name: string;
    description?: string;
}

const schema = yup.object().shape({
    name: yup.string().required('Tên sản phẩm không được bỏ trống'),
    description: yup.string(),
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

    const [categories, setCategories] = useState([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosClient.get('/online-shop/categories', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            setCategories(response.data);
        } catch (err: any) {
            console.error(err);
        }
    };

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (selectedId !== null) {
                const response = await axiosClient.patch(`/online-shop/categories/${selectedId}`, data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 200) {
                    message.success('Cập nhật thành công');
                    fetchData();
                    setSelectedId(null);
                }
            } else {
                const response = await axiosClient.post('/online-shop/categories', data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 201) {
                    message.success('Thêm mới thành công');
                    fetchData();
                }
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    const handleAddButtonClick = () => {
        setSelectedId(null);
        setValue('name', '');
        setValue('description', '');
    };

    const onDelete = async (categoryId: number) => {
        try {
            const response = await axiosClient.delete(`/online-shop/categories/${categoryId}`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            if (response.status === 204) {
                message.success('Xóa thành công');
                fetchData();
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    return (
        <div className="table-responsive">
            <h1>{selectedId !== null ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="d-flex flex-column">
                    <label htmlFor="name" className="form-label text-light fs-4">
                        Tên sản phẩm
                    </label>
                    <input {...register('name')} id="name" className="form-control" placeholder='Nhập tên sản phẩm' />
                    <span className="text-danger">{errors.name?.message}</span>
                </div>

                <div className="d-flex flex-column">
                    <label htmlFor="description" className="form-label text-light fs-4 ">
                        Mô tả sản phẩm
                    </label>
                    <input {...register('description')} id="description" className="form-control text-dark " placeholder='Mô tả sản phẩm ' />
                    <span className="text-danger">{errors.description?.message}</span>
                </div>

                <div className="mt-2">
                    <button type="submit" className="btn btn-danger">
                        {selectedId !== null ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-success ms-2"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                        onClick={handleAddButtonClick}
                    >
                        Thêm
                    </button>
                </div>
            </form>

            <table className="table table-striped table-success table-bordered table-hover ">
                <thead className="thead-success">
                    <tr>
                        <th>STT</th>
                        <th>Tên danh mục</th>
                        <th>Mô tả</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category: any, index: number) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{category.name}</td>
                            <td>{category.description?.slice(0, 100)} ...</td>
                            <td className='d-flex'>
                                <button
                                    type='button'
                                    className='btn btn-warning'
                                    data-bs-toggle='modal'
                                    data-bs-target='#exampleModal'
                                    onClick={() => {
                                        setSelectedId(category.id);
                                        setValue('name', category.name);
                                        setValue('description', category.description);
                                    }}
                                >
                                    Sửa
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-success ms-2'
                                    data-bs-toggle='modal'
                                    data-bs-target='#exampleModal'
                                    onClick={handleAddButtonClick}
                                >
                                    Thêm
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-danger ms-2'
                                    onClick={() => onDelete(category.id)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='modal fade' id='exampleModal' tabIndex={-1} aria-labelledby='exampleModalLabel' aria-hidden='true'>
                {/* Modal */}
            </div>
        </div>
    );
};

export default InsertDataWithAxios;
