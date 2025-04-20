import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
    name: "company",
    initialState: {
        singleCompany: null,
        companies: [],
        searchCompanyByText: "",
    },
    reducers: {
        // Actions
        setSingleCompany: (state, action) => {
            state.singleCompany = action.payload;
        },
        setCompanies: (state, action) => {
            state.companies = action.payload;
        },
        setSearchCompanyByText: (state, action) => {
            state.searchCompanyByText = action.payload;
        },
        // Add setCompanyDetails action here
        setCompanyDetails: (state, action) => {
            state.singleCompany = action.payload;
        },
    },
});

export const { setSingleCompany, setCompanies, setSearchCompanyByText, setCompanyDetails } = companySlice.actions;
export default companySlice.reducer;
