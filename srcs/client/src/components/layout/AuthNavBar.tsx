import {
  NavLink,
  HashRouter
} from "react-router-dom";

import classes from './AuthNavBar.module.css';

function AuthNavBar() {
    return (
        <HashRouter>
            <div>
                <ul className="header">
                    <li className={classes.links}><NavLink to="/register">Register</NavLink></li>
                    <li className={classes.links}><NavLink to="/login">Login</NavLink></li>
                </ul>
            </div>
        </HashRouter>

    )
}

export default AuthNavBar;
