import MainNavBar from '../components/layout/MainNavBar';

function RulesPage(props: any) {
    return (
        <div>
        <MainNavBar/>
        <h1>RULES</h1>
        <h2>Ranked</h2>
        <p>Classic pong game, first to 5 points wins.
            No power ups, no game modifications.
            Count for the Ladder.</p>
        <h2>Custom</h2>
        <p>Custom game where you can choose the rules. 
            Does not count for the Ladder.
            You can modify speed and add powerups.
        </p>
        <h3>Power-ups :</h3>
        <ul>
            <li>I : accelerate the game</li>
            <li>II : reduce ball size</li>
            <li>III : increase paddle size</li>
        </ul>
        </div>
    )
}

export default RulesPage