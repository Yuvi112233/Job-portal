import { setAllAdminJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchAllAdminJobs = async () => {
            try {
                const token = localStorage.getItem("token"); // ✅ Get the token from localStorage
                const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // ✅ Add the Authorization header
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });
                
                if (res.data.success) {
                    dispatch(setAllAdminJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchAllAdminJobs();
    }, [dispatch]);
};

export default useGetAllAdminJobs;
