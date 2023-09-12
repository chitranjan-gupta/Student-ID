"use client";
import React from "react";
import {
  List,
  ListItem,
  ListItemSuffix,
  ListItemPrefix,
  Typography,
  Card,
  IconButton,
} from "@material-tailwind/react";
import { ShieldCheckIcon, WalletIcon } from "@heroicons/react/20/solid"

export default function Wallet({ choose }) {
  return <Card className="w-96">
    <List>
      <ListItem>
        <ListItemPrefix>
          <WalletIcon className="w-5 h-5" />
        </ListItemPrefix>
        <div>
          <Typography variant="h6" color="blue-gray">
            Lissi Wallet
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            by Main Incubator GmbH
          </Typography>
        </div>
        <ListItemSuffix>
          <IconButton variant="text" color="blue-gray" onClick={choose}>
            <ShieldCheckIcon className="w-5 h-5" />
          </IconButton>
        </ListItemSuffix>
      </ListItem>
      <ListItem>
        <ListItemPrefix>
          <WalletIcon className="w-5 h-5" />
        </ListItemPrefix>
        <div>
          <Typography variant="h6" color="blue-gray">
            Trinsic Wallet
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            by Trinsic
          </Typography>
        </div>
        <ListItemSuffix>
          <IconButton variant="text" color="blue-gray">
            <ShieldCheckIcon className="w-5 h-5" />
          </IconButton>
        </ListItemSuffix>
      </ListItem>
      <ListItem>
        <ListItemPrefix>
          <WalletIcon className="w-5 h-5" />
        </ListItemPrefix>
        <div>
          <Typography variant="h6" color="blue-gray">
            Orbit Edge
          </Typography>
          <Typography variant="small" color="gray" className="font-normal">
            by Northern Block Inc.
          </Typography>
        </div>
        <ListItemSuffix>
          <IconButton variant="text" color="blue-gray">
            <ShieldCheckIcon className="w-5 h-5" />
          </IconButton>
        </ListItemSuffix>
      </ListItem>
    </List>
  </Card>
}