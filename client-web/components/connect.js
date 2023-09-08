"use client";
import React from "react";
import { QRCodeSVG } from "qrcode.react";
export default function Connect({ url }){
    return <div>
         <QRCodeSVG value={url.invitationUrl?url.invitationUrl:"Generating.."} className="w-60 h-60"/>
    </div>
}