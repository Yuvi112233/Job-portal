import { setAllJobs } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector(store => store.job);
    const token = localStorage.getItem('token'); // Or you can use Redux or Context API to get the token

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Adding token to the request headers
                    },
                    withCredentials: true // Keeping this if your API also requires cookies
                });

                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        };

        if (searchedQuery) {
            fetchAllJobs();
        }
    }, [searchedQuery, dispatch, token]);  // Re-run when searchedQuery or token changes
};

export default useGetAllJobs;
