import React from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../configs/axiosClient';
import numeral from 'numeral';
import Post from './Products/post'
type Props = {};

export default function Products({ }: Props) {

    return (
        <Post />
    );
}