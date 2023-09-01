import { useState } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Checkbox,
  Button,
} from "@material-tailwind/react";
export default function Register({ forward }){
    const [isSign, setSign] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const next = () => {
        if(isSign){
            if(firstName.length > 0 && lastName.length > 0)forward()
        }else{
            if(firstName.length > 0 && lastName.length > 0)forward()
        }
    }
    return <Card className="w-96">
      <CardHeader
        className="mb-4 grid h-28 place-items-center bg-gray-900"
        onClick={() => setSign(true)}
      >
        <Typography variant="h3" color="white">
          Sign In
        </Typography>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        {isSign?<><Input label="First Name" onChange={(event) => setFirstName(event.value)} size="lg" />
        <Input label="Last Name" onChange={(event) => setLastName(event.value)} size="lg" />
        <div className="-ml-2.5">
          <Checkbox label="Remember Me" />
        </div><Button onClick={next}>Sign Up</Button></>:<><Input label="First Name" onChange={(event) => setFirstName(event.value)} size="lg" className="outline-none"/>
        <Input label="Last Name" onChange={(event) => setLastName(event.value)} size="lg" />
        <Button onClick={next}>Sign Up</Button>
        </>} 
      </CardBody>
      <CardFooter
        className="mx-4 grid h-28 place-items-center rounded-xl -mb-4 bg-gray-900"
        onClick={() => setSign(false)}
        >
        <Typography variant="h3" color="white">
          Sign Up
        </Typography>
      </CardFooter>
    </Card>
}