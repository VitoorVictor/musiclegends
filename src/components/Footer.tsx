import TimeMusic from "./TimeMusic";
import React, { useState, useEffect, useRef, useMemo } from "react";
import "../components-css/Footer.css";

interface Music {
  title: string;
  artist: string;
  filePath: string;
}

const Footer = () => {
  const musicList: Music[] = useMemo(
    () => [
      {
        title: "Legends Never Die",
        artist: "Against The Current",
        filePath: "/musics/Legends Never Die.mp3",
      },
      {
        title: "Rise",
        artist: "League of Legends",
        filePath: "/musics/Rise.mp3",
      },
      {
        title: "Warriors",
        artist: "Imagine Dragons",
        filePath: "/musics/Warriors.mp3",
      },
      {
        title: "Take Over",
        artist: "The Glitch Mob",
        filePath: "/musics/Take Over.mp3",
      },
      {
        title: "Giants",
        artist: "True Damage",
        filePath: "/musics/Giants.mp3",
      },
      { title: "Awaken", artist: "Valorant", filePath: "/musics/Awaken.mp3" },
      { title: "Pop Stars", artist: "K/DA", filePath: "/musics/Pop Stars.mp3" },
    ],
    []
  );
  //Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  //Music Index
  const [indexMusic, setIndexMusic] = useState<number>(0);
  //useStates pause and play
  const [shouldAutoplay, setShouldAutoplay] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  //useStates volume and mute
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [volumeOld, setVolumeOld] = useState<number>(volume);
  //useStates repeat
  const [repeatMusic, setRepeatMusic] = useState<boolean>(false);
  //useStates random
  const [randomMusic, setRandomMusic] = useState<boolean>(false);

  const [musicPlayed, setMusicPlayed] = useState<number[]>([0]);

  useEffect(() => {
    if (audioRef.current && shouldAutoplay) {
      audioRef.current.src = musicList[indexMusic].filePath;
      audioRef.current.play();
      setShouldAutoplay(false); // Reset autoplay state
    }
  }, [indexMusic, musicList, shouldAutoplay]);

  useEffect(() => {
    if (repeatMusic) {
      // Se repeatMusic for true, configurar o intervalo
      const interval = setInterval(() => {
        if (audioRef.current) {
          // Verifica se o áudio chegou ao fim
          if (audioRef.current.currentTime === audioRef.current.duration) {
            audioRef.current.play();
          }
        } else {
          // Limpa o intervalo se o elemento de áudio não existir
          clearInterval(interval);
        }
      }, 500);

      // Função de limpeza para o useEffect
      return () => {
        clearInterval(interval);
      };
    } else if (randomMusic) {
      const getRandomIndex = (musicList: Music[]): number => {
        let randomIndex: number;
        do {
          randomIndex = Math.floor(Math.random() * musicList.length);
        } while (musicPlayed.includes(randomIndex));

        setMusicPlayed((prev) => [...prev, randomIndex]);
        return randomIndex;
      };

      const interval = setInterval(() => {
        if (audioRef.current) {
          if (audioRef.current.currentTime === audioRef.current.duration) {
            const randomIndex = getRandomIndex(musicList);
            setIndexMusic(randomIndex);
            audioRef.current.addEventListener(
              "canplaythrough",
              () => {
                if (audioRef.current) {
                  audioRef.current.play();
                }
              },
              { once: true }
            );
            clearInterval(interval);
          }
        } else {
          clearInterval(interval);
        }
      }, 500);

      return () => {
        clearInterval(interval);
      };
    } else {
      const interval = setInterval(() => {
        if (audioRef.current) {
          // Verifica se o áudio chegou ao fim
          if (audioRef.current.currentTime === audioRef.current.duration) {
            setIndexMusic(indexMusic + 1);
            audioRef.current.pause(); // Pausa a reprodução atual
            audioRef.current.addEventListener(
              "canplaythrough",
              () => {
                if (audioRef.current) {
                  audioRef.current.play();
                }
              },
              { once: true }
            );
          }
        } else {
          // Limpa o intervalo se o elemento de áudio não existir
          clearInterval(interval);
        }
      }, 500);

      // Função de limpeza para o useEffect
      return () => {
        clearInterval(interval);
      };
    }
  }, [repeatMusic, indexMusic, randomMusic, musicList, musicPlayed]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying); // Alterna o estado entre tocar e pausar
    }
  };

  const handleNextPrev = (param: string) => {
    setShouldAutoplay(true);

    if (randomMusic) {
      if (musicPlayed.length === musicList.length) {
        // Get the first element of the musicPlayed list to repeat
        const firstIndex = musicPlayed[0]; // Start repeating from the first element in the musicPlayed array

        if (param === "next") {
          setIndexMusic(firstIndex);
          setMusicPlayed((prev) => [...prev.slice(1), firstIndex]); // Move the first element to the end
        } else if (param === "prev") {
          setIndexMusic(firstIndex);
          setMusicPlayed((prev) => [firstIndex, ...prev.slice(0, -1)]); // Move the first element to the beginning
        }

        return; // Exit to prevent further execution
      }
      const getRandomIndex = (musicList: Music[]): number => {
        let randomIndex: number;
        do {
          randomIndex = Math.floor(Math.random() * musicList.length);
        } while (musicPlayed.includes(randomIndex));

        setMusicPlayed((prev) => [...prev, randomIndex]);
        return randomIndex;
      };

      const getLastRandomIndex = (musicPlayed: number[]): number => {
        const lastIndex = musicPlayed[musicPlayed.length - 2];
        return lastIndex >= 0 ? lastIndex : 0;
      };

      if (param === "next") {
        const randomIndex = getRandomIndex(musicList);
        setIndexMusic(randomIndex);
      } else if (param === "prev") {
        const lastIndex = getLastRandomIndex(musicPlayed);
        setIndexMusic(lastIndex);
        setMusicPlayed((prev) => prev.slice(0, -1)); // Remove the last played song from the stack
      }
    } else {
      if (param === "next") {
        const maxIndexMusic = musicList.length;
        setIndexMusic((prevIndex) =>
          prevIndex === maxIndexMusic - 1 ? 0 : prevIndex + 1
        );
      } else if (param === "prev") {
        const maxIndexMusic = musicList.length;
        setIndexMusic((prevIndex) =>
          prevIndex === 0 ? maxIndexMusic - 1 : prevIndex - 1
        );
      }
    }

    setIsPlaying(true);
  };

  const handleRepeat = () => {
    // Inverte o estado atual de repeatMusic
    setRepeatMusic((prevRepeatMusic) => !prevRepeatMusic);
  };
  const handleRandomRepeat = () => {
    // Inverte o estado atual de randomMusic
    setRandomMusic((prevRandomMusic) => !prevRandomMusic);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume; // Ajusta o volume do elemento de áudio
    }
    setVolumeOld(volume);
  };

  const handleMutedToggle = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        setVolume(volumeOld);
        setVolumeOld(volume);
      } else {
        audioRef.current.muted = true;
        setVolumeOld(volume);
        setVolume(0);
      }

      setIsMuted(!isMuted);
    }
  };

  return (
    <footer className="flex flex-col ">
      <audio ref={audioRef} src={musicList[indexMusic].filePath}></audio>
      <TimeMusic audioRef={audioRef} />
      <main className="bg-dark-10/90 md:h-24 h-36 md:pb-0 md:pt-0 pt-2 pb-4 w-screen flex md:flex-row flex-col justify-around md:items-center text-lg">
        <div className="Infos flex justify-between px-10 md:px-0 md:justify-center gap-2 items-center text-white md:w-80 w-screen h-full ">
          <img
            src="/img/button-favorite.svg"
            alt=""
          />
          <div className="flex-row items-start md:items-center h-auto">
            <h2 className="font-bold text-xl lg:text-2xl">
              {musicList[indexMusic].title}
            </h2>
            <p className="text-sm">
              {musicList[indexMusic].artist.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-1 group md:hidden">
            <button onClick={handleMutedToggle} className="hover:scale-110">
              {!isMuted && volume > 0.01 ? (
                <svg
                  className="hover:scale-110"
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.6665 14.6667L15.9998 20.0001H10.6665V28.0001H15.9998L22.6665 33.3334V14.6667Z"
                    stroke="#929292"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M28.7202 19.2799C29.97 20.5301 30.6721 22.2255 30.6721 23.9932C30.6721 25.761 29.97 27.4564 28.7202 28.7066M33.4269 14.5732C35.5002 17.4999 37.3307 20.4644 37.3307 23.9999C37.3307 27.5354 35.5002 30.4999 33.4269 33.4266C33.4269 33.4266 37.5002 28.0102 37.5002 23.9999C37.5002 19.9896 33.4269 14.5732 33.4269 14.5732Z"
                    stroke="#929292"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="hover:scale-110"
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 22.6665 14.6667 L 15.9998 20.0001 H 10.6665 V 28.0001 H 15.9998 L 22.6665 33.3334 V 14.6667 Z Z M 26 27 L 26 27 L 28 29 L 31 26 L 34 29 L 36 27 L 33 24 L 36 21 L 34 19 L 31 22 L 28 19 L 26 21 L 29 24 L 26 27 L 26 27 M 28 27 L 31 24 L 34 27 L 31 24 L 34 21 L 31 24 L 28 21 L 31 24 L 28 27 L 28 27"
                    stroke="#EB4848"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              )}
            </button>
            <input
              className="h-4 
                            appearance-none
                            bg-gray-10 
                            rounded-lg
                            focus:outline-none
                            group-hover:flex 
                            hover:cursor-pointer
                            hover:bg-gray-10/80
                            z-50
                            hidden"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>

        <div className="commands flex justify-center lg:gap-10 md:gap-4 gap-6 items-center w-auto px-4 h-full">
          {/* Random Button */}
          <button
            className="hover:scale-110 flex items-center justify-center"
            onClick={() => handleRandomRepeat()}
          >
            {!randomMusic ? (
              <svg
                width="49"
                height="48"
                viewBox="0 0 49 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M31.1667 9.33325L36.5001 14.6666L31.1667 19.9999"
                  stroke="#929292"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12.5 22.6667V20.0001C12.5 18.5856 13.0619 17.229 14.0621 16.2288C15.0623 15.2287 16.4188 14.6667 17.8333 14.6667H36.5"
                  stroke="#929292"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M17.8333 38.6667L12.5 33.3333L17.8333 28"
                  stroke="#929292"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M36.5 25.3333V27.9999C36.5 29.4144 35.9381 30.771 34.9379 31.7712C33.9377 32.7713 32.5812 33.3333 31.1667 33.3333H12.5"
                  stroke="#929292"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="49"
                height="48"
                viewBox="0 0 49 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M31.1667 9.33325L36.5001 14.6666L31.1667 19.9999"
                  stroke="#EB4848"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12.5 22.6667V20.0001C12.5 18.5856 13.0619 17.229 14.0621 16.2288C15.0623 15.2287 16.4188 14.6667 17.8333 14.6667H36.5"
                  stroke="#EB4848"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M17.8333 38.6667L12.5 33.3333L17.8333 28"
                  stroke="#EB4848"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M36.5 25.3333V27.9999C36.5 29.4144 35.9381 30.771 34.9379 31.7712C33.9377 32.7713 32.5812 33.3333 31.1667 33.3333H12.5"
                  stroke="#EB4848"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            )}
            ;
          </button>

          {/* Prev Button */}
          <button
            className="hover:scale-110  flex items-center justify-center"
            onClick={() => handleNextPrev("prev")}
          >
            <svg width="49" height="48" viewBox="0 0 49 48" fill="none">
              <path
                d="M28.5 32L20.5 24L28.5 16"
                stroke="#929292"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          {/* Play Button*/}
          <button
            onClick={handlePlayPause}
            className="transition duration-300 ease-in-out transform hover:scale-110  flex items-center justify-center"
          >
            {isPlaying ? (
              <svg
                width="49px"
                height="49px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-opacity duration-300 ease-in-out"
              >
                <path
                  d="M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2C7.88562 2 8.82843 2 9.41421 2.58579C10 3.17157 10 4.11438 10 6V18C10 19.8856 10 20.8284 9.41421 21.4142C8.82843 22 7.88562 22 6 22C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18V6Z"
                  fill="#929292"
                />
                <path
                  d="M14 6C14 4.11438 14 3.17157 14.5858 2.58579C15.1716 2 16.1144 2 18 2C19.8856 2 20.8284 2 21.4142 2.58579C22 3.17157 22 4.11438 22 6V18C22 19.8856 22 20.8284 21.4142 21.4142C20.8284 22 19.8856 22 18 22C16.1144 22 15.1716 22 14.5858 21.4142C14 20.8284 14 19.8856 14 18V6Z"
                  fill="#929292"
                />
              </svg>
            ) : (
              <svg
                width="49"
                height="48"
                viewBox="0 0 49 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-opacity duration-300 ease-in-out"
              >
                <path
                  d="M14 7.47751V40.5225C14.0049 40.7862 14.0792 41.044 14.2155 41.2698C14.3518 41.4956 14.5452 41.6814 14.7762 41.8086C15.0073 41.9358 15.2678 41.9999 15.5314 41.9943C15.7951 41.9887 16.0527 41.9138 16.2781 41.7769L43.2931 25.2544C43.5089 25.1238 43.6874 24.9397 43.8112 24.72C43.9351 24.5002 44.0001 24.2523 44.0001 24C44.0001 23.7478 43.9351 23.4998 43.8112 23.2801C43.6874 23.0603 43.5089 22.8762 43.2931 22.7456L16.2781 6.22314C16.0527 6.08628 15.7951 6.01128 15.5314 6.00571C15.2678 6.00013 15.0073 6.06418 14.7762 6.19139C14.5452 6.3186 14.3518 6.50448 14.2155 6.73028C14.0792 6.95608 14.0049 7.21382 14 7.47751Z"
                  fill="#EB4848"
                  stroke="#EB4848"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {/* Next Button */}
          <button
            className="hover:scale-110  flex items-center justify-center"
            onClick={() => handleNextPrev("next")}
          >
            <svg width="49" height="48" viewBox="0 0 49 48" fill="none">
              <path
                d="M20.5 32L28.5 24L20.5 16"
                stroke="#929292"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          {/* Repeat Button*/}
          <button
            className="hover:scale-110  flex items-center justify-center"
            onClick={() => handleRepeat()}
          >
            {!repeatMusic ? (
              <svg width="49" height="48" viewBox="0 0 49 48" fill="none">
                <g clip-path="url(#clip0_299593_4708)">
                  <path
                    d="M39.1667 13.3333V21.3333H31.1667"
                    stroke="#929292"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M35.82 28.0001C34.9533 30.4533 33.3127 32.5584 31.1455 33.9981C28.9784 35.4378 26.4019 36.1342 23.8046 35.9822C21.2072 35.8303 18.7295 34.8383 16.745 33.1557C14.7605 31.4731 13.3766 29.1911 12.8018 26.6535C12.2271 24.116 12.4926 21.4603 13.5585 19.0869C14.6243 16.7134 16.4327 14.7506 18.7111 13.4943C20.9896 12.238 23.6146 11.7562 26.1906 12.1216C28.7667 12.487 31.1542 13.6798 32.9933 15.5201L39.1667 21.3334"
                    stroke="#929292"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_299593_4708">
                    <rect
                      width="32"
                      height="32"
                      fill="white"
                      transform="translate(8.5 8)"
                    />
                  </clipPath>
                </defs>
              </svg>
            ) : (
              <svg width="49" height="48" viewBox="0 0 49 48" fill="none">
                <g clip-path="url(#clip0_299593_4708)">
                  <path
                    d="M39.1667 13.3333V21.3333H31.1667"
                    stroke="#EB4848"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M35.82 28.0001C34.9533 30.4533 33.3127 32.5584 31.1455 33.9981C28.9784 35.4378 26.4019 36.1342 23.8046 35.9822C21.2072 35.8303 18.7295 34.8383 16.745 33.1557C14.7605 31.4731 13.3766 29.1911 12.8018 26.6535C12.2271 24.116 12.4926 21.4603 13.5585 19.0869C14.6243 16.7134 16.4327 14.7506 18.7111 13.4943C20.9896 12.238 23.6146 11.7562 26.1906 12.1216C28.7667 12.487 31.1542 13.6798 32.9933 15.5201L39.1667 21.3334"
                    stroke="#EB4848"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_299593_4708">
                    <rect
                      width="32"
                      height="32"
                      fill="white"
                      transform="translate(8.5 8)"
                    />
                  </clipPath>
                </defs>
              </svg>
            )}
          </button>
        </div>

        <div className="md:flex justify-center lg:gap-10 gap-4 items-center  w-80 hidden h-full">
          <div className="flex items-center gap-1 group">
            <button onClick={handleMutedToggle} className="hover:scale-110">
              {!isMuted && volume > 0.01 ? (
                <svg
                  className="hover:scale-110"
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.6665 14.6667L15.9998 20.0001H10.6665V28.0001H15.9998L22.6665 33.3334V14.6667Z"
                    stroke="#929292"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M28.7202 19.2799C29.97 20.5301 30.6721 22.2255 30.6721 23.9932C30.6721 25.761 29.97 27.4564 28.7202 28.7066M33.4269 14.5732C35.5002 17.4999 37.3307 20.4644 37.3307 23.9999C37.3307 27.5354 35.5002 30.4999 33.4269 33.4266C33.4269 33.4266 37.5002 28.0102 37.5002 23.9999C37.5002 19.9896 33.4269 14.5732 33.4269 14.5732Z"
                    stroke="#929292"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="hover:scale-110"
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 22.6665 14.6667 L 15.9998 20.0001 H 10.6665 V 28.0001 H 15.9998 L 22.6665 33.3334 V 14.6667 Z Z M 26 27 L 26 27 L 28 29 L 31 26 L 34 29 L 36 27 L 33 24 L 36 21 L 34 19 L 31 22 L 28 19 L 26 21 L 29 24 L 26 27 L 26 27 M 28 27 L 31 24 L 34 27 L 31 24 L 34 21 L 31 24 L 28 21 L 31 24 L 28 27 L 28 27"
                    stroke="#EB4848"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              )}
            </button>
            <input
              className="h-2 
                            appearance-none
                            bg-gray-10 
                            rounded-lg
                            focus:outline-none
                            group-hover:flex 
                            hover:cursor-pointer
                            hover:bg-gray-10/80
                            lg:flex
                            z-50
                            hidden"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>
      </main>
    </footer>
  );
};
export default Footer;
