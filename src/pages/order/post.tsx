import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm, useFieldArray, Control } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosClient from '../configs/axiosClient';
import { message } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';

interface IFormInput {
    id: number; // Make the ID optional as it's not needed during creation
    createdDate: string;
    shippedDate: string;
    status: string;
    description: string;
    shippingAddress: string;
    shippingCity: string;
    paymentType: string;
    customerId: number;
    employeeId: number;
    orderDetails: {
        orderId: number;
        productId: number;
        quantity: number;
        price: number;
        discount: number;
    }[];
}

const schema = yup.object().shape({
    createdDate: yup.string().required('Ngày tạo không được bỏ trống'),
    shippedDate: yup.string().required('Ngày gửi không được bỏ trống'),
    status: yup.string().required('Trạng thái không được bỏ trống'),
    description: yup.string().required('Mô tả không được bỏ trống'),
    shippingAddress: yup.string().required('Địa chỉ gửi hàng không được bỏ trống'),
    shippingCity: yup.string().required('Thành phố gửi hàng không được bỏ trống'),
    paymentType: yup.string().required('Loại thanh toán không được bỏ trống'),
    customerId: yup.number().required('ID khách hàng không được bỏ trống'),
    employeeId: yup.number().required('ID nhân viên không được bỏ trống'),
    orderDetails: yup
        .array()
        .of(
            yup.object().shape({
                orderId: yup.number().required('ID đơn hàng không được bỏ trống'),
                productId: yup.number().required('ID sản phẩm không được bỏ trống'),
                quantity: yup.number().required('Số lượng không được bỏ trống'),
                price: yup.number().required('Giá không được bỏ trống'),
                discount: yup.number().required('Giảm giá không được bỏ trống'),
            })
        )
        .required('Chi tiết đơn hàng không được bỏ trống'),
});

const InsertDataWithAxios: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        control,
    } = useForm<IFormInput>({
        resolver: yupResolver(schema) as any,
    });

    const {
        fields: orderDetailsFields,
        append,
        remove,
    } = useFieldArray({
        control,
        name: 'orderDetails',
    });

    const [orders, setOrders] = useState<IFormInput[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get('/online-shop/orders', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                setOrders(response.data);
            } catch (err: any) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            if (selectedId !== null) {
                const response = await axiosClient.patch(`/online-shop/orders/${selectedId}`, data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 200) {
                    message.success('Cập nhật thành công');
                    setOrders((prevOrders) =>
                        prevOrders.map((order) => (order.id === selectedId ? { ...order, ...data } : order))
                    );
                    setSelectedId(null);
                    handleResetForm();
                }
            } else {
                const response = await axiosClient.post('/online-shop/orders', data, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    },
                });

                if (response.status === 201) {
                    message.success('Thêm mới thành công');
                    setOrders((prevOrders) => [...prevOrders, response.data]);
                    handleResetForm();
                }
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    const handleResetForm = () => {
        setSelectedId(null);
        setValue('createdDate', '');
        setValue('shippedDate', '');
        setValue('status', '');
        setValue('description', '');
        setValue('shippingAddress', '');
        setValue('shippingCity', '');
        setValue('paymentType', '');
        setValue('customerId', 0);
        setValue('employeeId', 0);
        setValue('orderDetails', []);
        setIsFormVisible(false);
    };

    const onDelete = async (orderId: number) => {
        try {
            const response = await axiosClient.delete(`/online-shop/orders/${orderId}`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            if (response.status === 204) {
                message.success('Xóa thành công');
                setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
            }
        } catch (err: any) {
            message.error(err.response?.data?.message[0] || 'Đã xảy ra lỗi');
        }
    };

    return (
        <div className="table-responsive">
            <h1>{selectedId !== null ? 'Sửa đơn hàng' : 'Thêm đơn hàng'}</h1>

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
                        <label htmlFor="createdDate" className="form-label text-light fs-4">
                            Ngày tạo
                        </label>
                        <input
                            {...register('createdDate')}
                            id="createdDate"
                            type="date"
                            className="form-control"
                            placeholder="Chọn ngày tạo"
                        />
                        <span className="text-danger">{errors.createdDate?.message}</span>
                    </div>

                    {/* ... (similar adjustments for other fields) */}
                    <div className="mb-2">
                        <label htmlFor="description" className="form-label text-light fs-4">
                            Mô tả
                        </label>
                        <input
                            {...register('description')}
                            id="description"
                            type="text"
                            className="form-control"
                            placeholder="Nhập mô tả"
                        />
                        <span className="text-danger">{errors.description?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="shippingAddress" className="form-label text-light fs-4">
                            Địa chỉ gửi hàng
                        </label>
                        <input
                            {...register('shippingAddress')}
                            id="shippingAddress"
                            type="text"
                            className="form-control"
                            placeholder="Nhập địa chỉ gửi hàng"
                        />
                        <span className="text-danger">{errors.shippingAddress?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="shippingCity" className="form-label text-light fs-4">
                            Thành phố gửi hàng
                        </label>
                        <input
                            {...register('shippingCity')}
                            id="shippingCity"
                            type="text"
                            className="form-control"
                            placeholder="Nhập thành phố gửi hàng"
                        />
                        <span className="text-danger">{errors.shippingCity?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="paymentType" className="form-label text-light fs-4">
                            Loại thanh toán
                        </label>
                        <input
                            {...register('paymentType')}
                            id="paymentType"
                            type="text"
                            className="form-control"
                            placeholder="Nhập loại thanh toán"
                        />
                        <span className="text-danger">{errors.paymentType?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="customerId" className="form-label text-light fs-4">
                            ID khách hàng
                        </label>
                        <input
                            {...register('customerId')}
                            id="customerId"
                            type="number"
                            className="form-control"
                            placeholder="Nhập ID khách hàng"
                        />
                        <span className="text-danger">{errors.customerId?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="employeeId" className="form-label text-light fs-4">
                            ID nhân viên
                        </label>
                        <input
                            {...register('employeeId')}
                            id="employeeId"
                            type="number"
                            className="form-control"
                            placeholder="Nhập ID nhân viên"
                        />
                        <span className="text-danger">{errors.employeeId?.message}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="orderDetails" className="form-label text-light fs-4">
                            Chi tiết đơn hàng
                        </label>
                        <div>
                            <div>
                                {orderDetailsFields.map((field, index) => (
                                    <div key={field.id} className="mb-2">
                                        <label
                                            htmlFor={`orderDetails[${index}].orderId`}
                                            className="form-label text-light fs-4"
                                        >
                                            ID đơn hàng
                                        </label>
                                        <input
                                            {...register(`orderDetails[${index}].orderId` as any)}
                                            id={`orderDetails[${index}].orderId`}
                                            type="number"
                                            className="form-control"
                                            placeholder="Nhập ID đơn hàng"
                                        />
                                        <span className="text-danger">
                                            {errors.orderDetails?.[index]?.orderId?.message}
                                        </span>

                                        {/* Product ID */}
                                        <label
                                            htmlFor={`orderDetails[${index}].productId`}
                                            className="form-label text-light fs-4"
                                        >
                                            ID sản phẩm
                                        </label>
                                        <input
                                            {...register(`orderDetails[${index}].productId` as any)}
                                            id={`orderDetails[${index}].productId`}
                                            type="number"
                                            className="form-control"
                                            placeholder="Nhập ID sản phẩm"
                                        />
                                        <span className="text-danger">
                                            {errors.orderDetails?.[index]?.productId?.message}
                                        </span>

                                        {/* Quantity */}
                                        <label
                                            htmlFor={`orderDetails[${index}].quantity`}
                                            className="form-label text-light fs-4"
                                        >
                                            Số lượng
                                        </label>
                                        <input
                                            {...register(`orderDetails[${index}].quantity` as any)}
                                            id={`orderDetails[${index}].quantity`}
                                            type="number"
                                            className="form-control"
                                            placeholder="Nhập số lượng"
                                        />
                                        <span className="text-danger">
                                            {errors.orderDetails?.[index]?.quantity?.message}
                                        </span>

                                        {/* Price */}
                                        <label
                                            htmlFor={`orderDetails[${index}].price`}
                                            className="form-label text-light fs-4"
                                        >
                                            Giá
                                        </label>
                                        <input
                                            {...register(`orderDetails[${index}].price` as any)}
                                            id={`orderDetails[${index}].price`}
                                            type="number"
                                            className="form-control"
                                            placeholder="Nhập giá"
                                        />
                                        <span className="text-danger">
                                            {errors.orderDetails?.[index]?.price?.message}
                                        </span>

                                        {/* Discount */}
                                        <label
                                            htmlFor={`orderDetails[${index}].discount`}
                                            className="form-label text-light fs-4"
                                        >
                                            Giảm giá
                                        </label>
                                        <input
                                            {...register(`orderDetails[${index}].discount` as any)}
                                            id={`orderDetails[${index}].discount`}
                                            type="number"
                                            className="form-control"
                                            placeholder="Nhập giảm giá"
                                        />
                                        <span className="text-danger">
                                            {errors.orderDetails?.[index]?.discount?.message}
                                        </span>

                                    </div>
                                ))}
                            </div>

                        </div>

                        <span className="text-danger">{errors.orderDetails?.message}</span>
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
                            <th>Ngày tạo</th>
                            <th>Ngày gửi</th>
                            <th>Trạng thái</th>
                            <th>Mô tả</th>
                            <th>Địa chỉ gửi hàng</th>
                            <th>Thành phố gửi hàng</th>
                            <th>Thao tác</th>
                            <th>vvv</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order: IFormInput, index: number) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{order.createdDate}</td>
                                <td>{order.shippedDate}</td>
                                <td>{order.status}</td>
                                <td>{order.description}</td>
                                <td>{order.shippingAddress}</td>
                                <td>{order.shippingCity}</td>



                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-warning ms-2"
                                        onClick={() => {
                                            setIsFormVisible(true);
                                            setSelectedId(order.id);
                                            setValue('createdDate', order.createdDate);
                                            setValue('shippedDate', order.shippedDate);
                                            setValue('status', order.status);
                                            setValue('description', order.description);
                                            setValue('shippingAddress', order.shippingAddress);
                                            setValue('shippingCity', order.shippingCity);
                                            setValue('paymentType', order.paymentType);
                                            setValue('customerId', order.customerId);
                                            setValue('employeeId', order.employeeId);
                                            setValue('orderDetails', order.orderDetails);
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger ms-2"
                                        onClick={() => onDelete(order.id)}
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
