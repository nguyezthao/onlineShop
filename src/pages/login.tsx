import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { BrowserRouter as Router } from 'react-router-dom';
import axiosClient from '../configs/axiosClient';
import backgroundImage from './3.jpg';
import Styles from '../css/login.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';




interface IFormInput {
    username: string;
    password: string;
}

const schema = yup.object().shape({
    username: yup.string().email().required(),
    password: yup.string().min(3).max(20).required(),
});

const LoginWithAxios: React.FC = () => {
    const history = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IFormInput>({
        resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            // Hardcoded credentials for demonstration purposes
            const hardcodedUsername = 'tungnt@aptech';
            const hardcodedPassword = '123456789';

            // Check if the entered credentials match the hardcoded values
            if (data.username === hardcodedUsername && data.password === hardcodedPassword) {
                // Simulate a successful login
                alert('LOGIN OK');

                // Redirect to the desired page after successful login
                history('./main');

                return; // Exit the function to prevent further execution
            }

            // Simulate a login request to the server
            const response = await axiosClient.post('/auth/login', data);

            // Log response for debugging
            console.log('Login response:', response.data);

            if (response.data.loggedInUser) {
                alert('LOGIN OK (ASYNC / AWAIT)');

                // Save token to localStorage
                localStorage.setItem('access_token', response.data.access_token);

                // Log token for debugging
                console.log('Token saved to local storage:', localStorage.getItem('access_token'));

                // Redirect to the main page after successful login
                history('/main');
            } else {
                alert('LOGIN FAILED (ASYNC / AWAIT)');
            }
        } catch (err: any) {
            // Log the entire error object for debugging
            console.error('Login error:', err);

            if (err.response && err.response.status === 401) {
                alert('LOGIN FAILED (401)');
            } else {
                alert('An error occurred during login. Please check the console for details.');
            }
        }
    };

    return (
        <div className="container-fluid" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <div className={Styles.container1}>
                <div className={Styles.content}>
                    <h1>WELCOME</h1>
                    <p>
                        Chúng tôi hân hạnh mời bạn tham gia vào trải nghiệm
                        <br /> sản phẩm website kết thúc môn học React của chúng tôi.
                        <br /> Website này được xây dựng với sự sáng tạo và kiến thức
                        <br /> đã tích lũy trong suốt khoá học,
                        <br /> sử dụng API bản quyền của Softech Aptech.
                    </p>
                </div>
                <div className={Styles.container2}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* USERNAME */}
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label text-light fs-4">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                {...register('username')}
                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                placeholder="Username"
                            />
                            <div className="invalid-feedback">{errors.username?.message}</div>
                        </div>

                        {/* PASSWORD */}
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label text-light fs-4">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                {...register('password')}
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                placeholder="Password"
                            />
                            <div className="invalid-feedback">{errors.password?.message}</div>
                        </div>

                        {/* SUBMIT */}
                        <button type="submit" className="btn btn-danger">
                            Login
                        </button>
                    </form>
                </div>
                <div className={Styles.img}></div>
            </div>
        </div>
    );
};

export default LoginWithAxios;
