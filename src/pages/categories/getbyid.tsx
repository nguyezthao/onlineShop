import React, { useState } from 'react';
import axiosClient from '../configs/axiosClient';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import 'bootstrap/dist/css/bootstrap.min.css';

interface IFormInput {
    id: number;
}

const schema = yup.object().shape({
    id: yup.number().required(),
});

const GetCategoryById: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IFormInput>({
        resolver: yupResolver(schema),
    });

    const [result, setResult] = useState<{ id: number; name: string; description: string } | null>(null);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            // Gửi yêu cầu GET đến API với id đã nhập
            const response = await axiosClient.get(`https://server.aptech.io/online-shop/categories/${data.id}`);

            // Kiểm tra xem phản hồi có thành công không
            if (response.status === 200) {
                // Lấy dữ liệu name và description từ phản hồi
                const { name, description } = response.data;

                // Lưu kết quả vào state để hiển thị trên giao diện
                setResult({ id: data.id, name, description });
            } else {
                console.error('Request failed with status:', response.status);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div> Nhập ID CẦN TÌM KIẾM
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 500, gap: 10, height: 700, margin: 50 }}>
                    {/* id */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label htmlFor='id'>ID</label>
                        <input {...register('id')} id='id' className='form-control' />
                        <span>{errors.id?.message}</span>
                    </div>
                    {/* submit */}
                    <button type='submit' name='Submit' className='btn btn-danger'>
                        Get Category
                    </button>
                    {/* Hiển thị kết quả */}
                    {result && (
                        <div>
                            <h2>Result</h2>
                            <p>ID: {result.id}</p>
                            <p>Name: {result.name}</p>
                            <p>Description: {result.description}</p>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default GetCategoryById;
