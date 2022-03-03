import React, {useEffect, useState} from "react";
import TicTacToe from "./components/TicTacToe";
import {ITicTacToe} from "./interfaces";
import {supabase} from "./services/supabaseClient";
import {motion} from "framer-motion";
import Icon from "@mdi/react";
import {mdiLoading} from "@mdi/js";
import {shareMove} from "./services/shareService";

function App() {
	const [gameId, setGameId] = useState<string | undefined>(undefined);
	const [lastMove, setLastMove] = useState<string | null>(null);
	const [isLoading, setLoading] = useState(true);
	const [loadingTransition, setLoadingTransition] = useState(false);
	const [finishMessage, setFinishMessage] = useState<
		{message: string; showShare: boolean; showRestart: boolean; type: "move" | "win" | "draw"; matrix: string[][]} | undefined
	>(undefined);
	const [finishTransition, setFinishTransition] = useState(false);
	const [matrix, setMatrix] = useState<string[][]>([
		["0", "0", "0"],
		["0", "0", "0"],
		["0", "0", "0"],
	]);

	useEffect(() => {
		function finishGame(e: CustomEvent) {
			const {winner, matrix} = e.detail;

			setFinishTransition(true);
			setTimeout(() => {
				setFinishMessage({
					message: `${winner} has won!. Would you like to start another game?`,
					showShare: true,
					showRestart: true,
					type: "win",
					matrix,
				});
			}, 1000);
		}

		function finishMove(e: CustomEvent) {
			const {matrix} = e.detail;

			setFinishTransition(true);
			setTimeout(() => {
				setFinishMessage({
					message: "You've made your move!.Share this with your friend so they can make theirs!",
					showShare: true,
					showRestart: false,
					type: "move",
					matrix,
				});
			}, 1000);
		}

		function finishDraw(e: CustomEvent) {
			const {matrix} = e.detail;

			setFinishTransition(true);
			setTimeout(() => {
				setFinishMessage({
					message: "You've stumbled upon a draw!.Would you like to start another game?",
					showShare: true,
					showRestart: true,
					type: "draw",
					matrix,
				});
			}, 1000);
		}

		document.addEventListener("finish-game", finishGame as any);
		document.addEventListener("finish-move", finishMove as any);
		document.addEventListener("finish-draw", finishDraw as any);
		return () => {
			document.removeEventListener("finish-game", finishGame as any);
			document.removeEventListener("finish-move", finishMove as any);
			document.removeEventListener("finish-draw", finishDraw as any);
		};
	}, []);

	useEffect(() => {
		setTimeout(() => {
			setLoading(loadingTransition);
		});
	}, [loadingTransition]);

	async function createNewGame() {
		const game = {
			id: Math.floor(Math.random() * Math.pow(10, 10)).toString(),
			last_move: undefined,
			matrix: [
				["0", "0", "0"],
				["0", "0", "0"],
				["0", "0", "0"],
			],
			players: [] as string[],
		};

		const {data, error} = await supabase.from<ITicTacToe>("tictactoe_game").insert([game]);
		if (!error && data) {
			setGameId(data[0].id);
			setLastMove(data[0].last_move);
			setMatrix(data[0].matrix);

			window.location.search = `?gid=${data[0].id}`;
		} else {
			throw error;
		}
	}

	useEffect(() => {
		async function getGameFromId(id: string) {
			const {data, error} = await supabase.from<ITicTacToe>("tictactoe_game").select("*").match({id}).single();
			if (error) throw error;
			return data;
		}

		setLoadingTransition(true);
		const params = new URLSearchParams(window.location.search);
		if (params.has("gid")) {
			try {
				const gid = params.get("gid") as string;
				getGameFromId(gid)
					.then((data) => {
						if (data) {
							setLastMove(data.last_move);
							setGameId(gid);
							setMatrix(JSON.parse(JSON.stringify(data.matrix)));
						} else {
							console.error("Error getting game from ID!");
						}
					})
					.catch((error) => {
						console.error("Invalid Game ID!", error.message);
						createNewGame().catch((error) => console.error(error, error.message));
					})
					.finally(() => {
						setLoadingTransition(false);
					});
			} catch {
				console.error("Invalid Game ID!");
				createNewGame()
					.catch((error) => console.error(error, error.message))
					.finally(() => setLoadingTransition(false));
			}
		} else {
			console.log("No game ID");
			createNewGame()
				.catch((error) => console.error(error, error.message))
				.finally(() => setLoadingTransition(false));
		}
	}, []);

	function updateGame(matrix: string[][], lastMove: string | null) {
		supabase
			.from<ITicTacToe>("tictactoe_game")
			.update({matrix, last_move: lastMove})
			.match({id: gameId})
			.then(({data, error}) => {
				if (error) {
					console.error(error, error.message);
				}
			});
	}

	return (
		<div className="w-full h-screen flex justify-center items-center bg-black">
			{!isLoading && !finishMessage && (
				<motion.div initial={{opacity: 0}} animate={{opacity: finishTransition ? 0 : 1}}>
					<TicTacToe matrix={matrix} lastMove={lastMove} gameUpdater={updateGame} />
				</motion.div>
			)}
			{isLoading && (
				<motion.div className="animate-spin">
					<Icon path={mdiLoading} color="white" size={4} />
				</motion.div>
			)}
			{!isLoading && finishMessage && (
				<motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
					<span className="flex flex-col justify-center items-center">
						{finishMessage.message.split(".").map((text, index) => (
							<span key={index} className="text-white font-bold text-xl text-center">
								{text}
							</span>
						))}
					</span>
					<div className={`flex ${!finishMessage.showRestart ? "justify-end" : "justify-between"} py-4 px-8 mt-4`}>
						{finishMessage.showRestart && (
							<button
								className="bg-neutral-400 text-white px-4 py-3 rounded-lg"
								onClick={() => {
									createNewGame();
								}}>
								Restart
							</button>
						)}
						{finishMessage.showShare && (
							<button
								className="bg-sky-500 text-white px-4 py-3 rounded-lg"
								onClick={() => {
									shareMove(finishMessage.matrix, finishMessage.type);
								}}>
								Share
							</button>
						)}
					</div>
				</motion.div>
			)}
		</div>
	);
}

export default App;
