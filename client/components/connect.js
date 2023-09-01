"use client";
import React from "react";
import { QRCodeSVG } from "qrcode.react";
export default function Connect(){
    return <div>
         <QRCodeSVG value="hello" />
    </div>
}