import { Auth } from "../components/Auth"

export const Signin = () => {
    return <div className="h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <Auth type="signin" />
        </div>
    </div>
}
