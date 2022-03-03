import {useEffect, useState} from "react";
import {TicTacToeApp} from "./TicTacToeApp";
import {motion} from "framer-motion";
import Icon from "@mdi/react";
import {mdiArrowLeft} from "@mdi/js";

const GAMES = {
	tictactoe: {
		game: <TicTacToeApp />,
		label: "Tic Tac Toe",
	},
};

export default function Home() {
	const [selectedGame, setSelectedGame] = useState<string | undefined>(undefined);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (params.has("g")) {
			const game = params.get("g");
			if (Object.keys(GAMES).includes(game as string)) setSelectedGame(game as string);
		}
	}, []);

	return (
		<div className="h-screen w-full flex flex-col justify-center items-center bg-black">
			{!selectedGame && (
				<div className="inline-grid gap-3 grid-cols-2 w-1/3 text-center">
					{Object.keys(GAMES).map((game: string, index: number) => (
						<motion.span
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							transition={{delay: 0.3 * index}}
							key={game}
							className="text-white font-extrabold text-2xl cursor-pointer"
							onClick={() => {
								setSelectedGame(game);
							}}>
							{GAMES[game as keyof typeof GAMES].label}
						</motion.span>
					))}
				</div>
			)}
			{selectedGame && (
				<>
					<div
						className="absolute top-5 left-5 hover:opacity-80 focus:opacity-80 cursor-pointer"
						onClick={() => {
							setSelectedGame(undefined);
							window.location.search = "";
						}}>
						<Icon path={mdiArrowLeft} color="white" size={1.5} />
					</div>
					{GAMES[selectedGame as keyof typeof GAMES].game}
				</>
			)}
		</div>
	);
}
