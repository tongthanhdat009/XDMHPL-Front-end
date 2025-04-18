import FormSignin from "../../../components/SigninPage/FormSignin";
import FooterSigninLogin from "../../../components/FooterSigninLogin/FooterSigninLogin";
const UserSignin = () => {
    return (
        <div className="signin-page flex flex-col items-center justify-center h-screen bg-gray-100"style={{ height:'fit-content'}}>
            <div class="text-center">
                <img src="public/logo.svg" alt="Logo" class="w-100 h-25" />
            </div>
            <FormSignin/>
            <FooterSigninLogin/>
        </div>
    );
}
export default UserSignin