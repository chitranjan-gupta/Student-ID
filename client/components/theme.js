"use client";
import { ThemeProvider } from "@material-tailwind/react";
export default function Theme({ children }){
    return <ThemeProvider>{children}</ThemeProvider>
}