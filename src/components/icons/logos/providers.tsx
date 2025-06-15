import { cn } from "@/lib/utils";
import Logo from "./logo";

export function OpenAI({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="32" height="32" viewBox="0 0 32 32">
      <circle id="Ellipse_6" data-name="Ellipse 6" cx="16" cy="16" r="16" fill="#fff" />
      <g id="Gruppe_10" data-name="Gruppe 10" transform="translate(6.332 5.876)">
        <path
          id="Pfad_30"
          data-name="Pfad 30"
          d="M19.929,7.9a4.811,4.811,0,0,0-.413-3.952,4.866,4.866,0,0,0-5.241-2.334A4.813,4.813,0,0,0,10.646,0,4.867,4.867,0,0,0,6,3.367,4.813,4.813,0,0,0,2.787,5.7a4.867,4.867,0,0,0,.6,5.706A4.811,4.811,0,0,0,3.8,15.359,4.866,4.866,0,0,0,9.04,17.693a4.809,4.809,0,0,0,3.629,1.617,4.867,4.867,0,0,0,4.643-3.371,4.813,4.813,0,0,0,3.217-2.334,4.868,4.868,0,0,0-.6-5.7ZM12.67,18.048a3.607,3.607,0,0,1-2.317-.838c.03-.016.081-.044.114-.065l3.846-2.221a.625.625,0,0,0,.316-.547V8.957l1.625.938a.057.057,0,0,1,.031.045v4.49a3.624,3.624,0,0,1-3.616,3.619ZM4.894,14.727A3.6,3.6,0,0,1,4.463,12.3l.114.068,3.846,2.221a.626.626,0,0,0,.632,0l4.695-2.711v1.877a.06.06,0,0,1-.023.05L9.839,16.052A3.623,3.623,0,0,1,4.9,14.727ZM3.882,6.333A3.607,3.607,0,0,1,5.766,4.746c0,.033,0,.092,0,.133V9.322a.626.626,0,0,0,.316.547l4.695,2.71-1.625.938a.057.057,0,0,1-.055,0L5.206,11.276A3.623,3.623,0,0,1,3.882,6.334ZM17.236,9.441,12.541,6.73l1.625-.938a.057.057,0,0,1,.055,0l3.888,2.244a3.62,3.62,0,0,1-.559,6.531V9.987a.625.625,0,0,0-.314-.547Zm1.617-2.435-.114-.068L14.893,4.717a.626.626,0,0,0-.632,0L9.567,7.428V5.551A.06.06,0,0,1,9.59,5.5l3.887-2.243a3.619,3.619,0,0,1,5.375,3.748ZM8.683,10.351,7.057,9.413a.057.057,0,0,1-.031-.045V4.879A3.62,3.62,0,0,1,12.962,2.1c-.03.016-.08.044-.114.065L9,4.384a.624.624,0,0,0-.316.547l0,5.419Zm.883-1.9L11.657,7.24l2.091,1.207v2.415l-2.091,1.207L9.566,10.862Z"
          transform="translate(-2.13 0.001)"
        />
      </g>
    </svg>
  );
}

export function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 186.69 190.5" className={cn("h-10 w-10", className)}>
      <g transform="translate(1184.583 765.171)">
        <path
          clipPath="none"
          mask="none"
          d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z"
          fill="#4285f4"
        />
        <path
          clipPath="none"
          mask="none"
          d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z"
          fill="#34a853"
        />
        <path
          clipPath="none"
          mask="none"
          d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z"
          fill="#fbbc05"
        />
        <path
          d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z"
          fill="#ea4335"
          clipPath="none"
          mask="none"
        />
      </g>
    </svg>
  );
}

export function MetaLogo({ className }: { className?: string }) {
  return (
    <svg
      id="Gruppe_1"
      data-name="Gruppe 1"
      xmlns="http://www.w3.org/2000/svg"
      width="287.56"
      height="191"
      viewBox="0 0 287.56 191"
      className={className}
    >
      <defs>
        <linearGradient
          id="linear-gradient"
          x1="0.139"
          y1="0.613"
          x2="0.891"
          y2="0.665"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#0064e1" />
          <stop offset="0.4" stopColor="#0064e1" />
          <stop offset="0.83" stopColor="#0073ee" />
          <stop offset="1" stopColor="#0082fb" />
        </linearGradient>
        <linearGradient
          id="linear-gradient-2"
          x1="0.543"
          y1="0.828"
          x2="0.543"
          y2="0.393"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#0082fb" />
          <stop offset="1" stopColor="#0064e0" />
        </linearGradient>
      </defs>
      <path
        id="Logo0"
        d="M31.06,125.96c0,10.98,2.41,19.41,5.56,24.51a18.963,18.963,0,0,0,16.57,9.51c8.1,0,15.51-2.01,29.79-21.76,11.44-15.83,24.92-38.05,33.99-51.98l15.36-23.6C143,46.25,155.35,28.03,169.51,15.68,181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,24.97,56.67,24.97,89.27,0,19.38-3.82,33.62-10.32,44.87C270.96,180.13,258.72,191,238.13,191V159.98c17.63,0,22.03-16.2,22.03-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,182.95,71.12,191,53.19,191c-21.27,0-34.72-9.21-43.05-23.09C3.34,156.6,0,141.76,0,124.85Z"
        fill="#0081fb"
      />
      <path
        id="Logo1"
        d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4.04,41.39,15.61,15.5,12.65,32.02,33.48,52.63,67.81l7.39,12.32c17.84,29.72,27.99,45.01,33.93,52.22,7.64,9.26,12.99,12.02,19.94,12.02,17.63,0,22.03-16.2,22.03-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C270.96,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45.04-7.39-7.85-16.89-17.33-32.05-17.33-12.27,0-22.69,8.61-31.41,21.78Z"
        fill="url(#linear-gradient)"
      />
      <path
        id="Logo2"
        d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,125.96c0,10.98,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3,38.73,15.35,59.28,0,82.85,0Z"
        fill="url(#linear-gradient-2)"
      />
    </svg>
  );
}

export function ReplicateLogo({ className }: { className?: string }) {
  return (
    <svg
      id="Gruppe_2"
      data-name="Gruppe 2"
      xmlns="http://www.w3.org/2000/svg"
      width="150"
      height="150"
      viewBox="0 0 150 150"
      className={className}
    >
      <path id="Pfad_1" data-name="Pfad 1" d="M0,0H150V150H0Z" fill="none" />
      <path id="Pfad_2" data-name="Pfad 2" d="M133.14,68.42V82.5H94.68v57.29H78.99V68.42Z" />
      <path id="Pfad_3" data-name="Pfad 3" d="M133.14,41.95v14H65.07v83.84H49.38V41.95Z" />
      <path id="Pfad_4" data-name="Pfad 4" d="M133.14,15.4v14H35.46V139.8H19.77V15.4Z" />
    </svg>
  );
}

export function XAILogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="438.67"
      height="481.45"
      viewBox="0 0 438.67 481.45"
    >
      <g id="Gruppe_3" data-name="Gruppe 3" transform="translate(-201.61 -56.91)">
        <path id="Pfad_5" data-name="Pfad 5" d="M557.09,211.99l8.31,326.37h66.56l8.32-445.18Z" fill="#fff" />
        <path id="Pfad_6" data-name="Pfad 6" d="M640.28,56.91H538.72L379.35,284.53l50.78,72.52Z" fill="#fff" />
        <path id="Pfad_7" data-name="Pfad 7" d="M201.61,538.36H303.17l50.79-72.52-50.79-72.53Z" fill="#fff" />
        <path id="Pfad_8" data-name="Pfad 8" d="M201.61,211.99,430.13,538.36H531.69L303.17,211.99Z" fill="#fff" />
      </g>
    </svg>
  );
}

export function DeepseekLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="56.202"
      height="41.359"
      viewBox="0 0 56.202 41.359"
    >
      <g id="Gruppe_4" data-name="Gruppe 4" transform="translate(0 0)">
        <path
          id="Pfad_9"
          data-name="Pfad 9"
          d="M55.613,3.471c-.6-.292-.852.264-1.2.547a2.645,2.645,0,0,0-.321.319A3.984,3.984,0,0,1,50.878,5.8,6.259,6.259,0,0,0,45.813,7.79a4.586,4.586,0,0,0-2.922-3.626,5.034,5.034,0,0,1-2.235-1.522A6.136,6.136,0,0,1,39.942.829c-.128-.373-.257-.756-.687-.82-.467-.073-.65.319-.833.647a8.549,8.549,0,0,0-.989,4.31,9.313,9.313,0,0,0,4.3,7.945.6.6,0,0,1,.3.756c-.192.656-.421,1.294-.623,1.95-.128.419-.321.51-.769.328a12.941,12.941,0,0,1-4.067-2.76A63.581,63.581,0,0,0,30.5,7.425c-.531-.392-1.062-.756-1.612-1.1-2.308-2.241.3-4.082.907-4.3.632-.228.22-1.012-1.823-1a17.857,17.857,0,0,0-6.292,1.6,7.15,7.15,0,0,1-1.09.319,22.474,22.474,0,0,0-6.75-.237A14.546,14.546,0,0,0,3.305,8.847,17.965,17.965,0,0,0,.356,23.069,21.737,21.737,0,0,0,8.224,36.308,21.019,21.019,0,0,0,23.3,41.319,17.845,17.845,0,0,0,35,36.964a10.963,10.963,0,0,0,4.167.929,13.668,13.668,0,0,0,3.993-.3c1.722-.364,1.6-1.959.98-2.25-5.047-2.351-3.938-1.394-4.946-2.168,2.564-3.034,6.43-6.187,7.941-16.4a9.483,9.483,0,0,0,0-1.977c-.009-.4.082-.556.54-.6a9.773,9.773,0,0,0,3.618-1.111c3.27-1.786,4.589-4.72,4.9-8.236a1.24,1.24,0,0,0-.577-1.376ZM27.119,35.123c-4.891-3.845-7.263-5.111-8.243-5.057-.916.055-.751,1.1-.55,1.786a6.546,6.546,0,0,0,.87,1.731A.894.894,0,0,1,18.931,35c-1.575.975-4.314-.328-4.442-.392a20.377,20.377,0,0,1-7.73-7.744,23.646,23.646,0,0,1-3.041-10.5c-.046-.9.22-1.221,1.117-1.385a11,11,0,0,1,3.581-.091,22.412,22.412,0,0,1,12.8,6.5,43.118,43.118,0,0,1,5.157,6.77,32.453,32.453,0,0,0,5.807,6.824,18.474,18.474,0,0,0,2.088,1.585c-1.877.209-5.01.255-7.153-1.44Zm2.345-15.079a.717.717,0,0,1,.724-.72.7.7,0,0,1,.247.045.643.643,0,0,1,.266.173.708.708,0,0,1,.2.5.717.717,0,0,1-.723.72.71.71,0,0,1-.715-.72Zm7.282,3.736a4.24,4.24,0,0,1-1.383.374,2.917,2.917,0,0,1-1.868-.592A2.8,2.8,0,0,1,32.2,21.784a4.047,4.047,0,0,1,.037-1.376,1.536,1.536,0,0,0-.559-1.7,2.428,2.428,0,0,0-1.612-.465,1.309,1.309,0,0,1-.6-.182.593.593,0,0,1-.266-.838,2.649,2.649,0,0,1,.449-.492,3.053,3.053,0,0,1,2.684.036A7.79,7.79,0,0,1,34.685,18.6a14.991,14.991,0,0,1,1.6,2.141,8.921,8.921,0,0,1,1.044,1.986c.156.456-.046.829-.586,1.057Z"
          fill="#4d6bfe"
        />
      </g>
    </svg>
  );
}

export function AnthropicLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="23.5"
      height="16.136"
      viewBox="0 0 23.5 16.136"
    >
      <g id="Gruppe_5" data-name="Gruppe 5" transform="translate(-0.25 -3.932)">
        <path id="Pfad_10" data-name="Pfad 10" d="M13.789,3.932l6.433,16.136H23.75L17.317,3.932Z" fill="#181818" />
        <path
          id="Pfad_11"
          data-name="Pfad 11"
          d="M6.325,13.683l2.2-5.671,2.2,5.671Zm.357-9.751L.25,20.068h3.6L5.162,16.68h6.729l1.315,3.389h3.6L10.371,3.932Z"
          fill="#181818"
        />
      </g>
    </svg>
  );
}

export function MistralLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="219.595"
      height="205.672"
      viewBox="0 0 219.595 205.672"
    >
      <defs>
        <clipPath id="clip-path">
          <path id="path33" d="M0-245.549H219.595V-39.877H0Z" transform="translate(-329.914 139.751)" />
        </clipPath>
        <clipPath id="clip-path-2">
          <path id="path48" d="M0-245.549H219.595V-39.877H0Z" transform="translate(-600.029 186.76)" />
        </clipPath>
      </defs>
      <g id="Gruppe_16" data-name="Gruppe 16" transform="translate(7.577 7.345)">
        <path id="path63" d="M75.627,113.332H37.832l.018-37.776h37.8Z" />
        <path id="path65" d="M113.4,151.108H75.608l.018-37.776h37.8Z" />
        <path id="path67" d="M113.422,113.332H75.627l.018-37.776h37.8Z" />
        <path id="use69" d="M151.217,113.332H113.422l.018-37.776h37.8Z" />
        <path id="path71" d="M75.646,75.555H37.851l.018-37.776h37.8Z" />
        <path id="use73" d="M151.236,75.555H113.441l.018-37.776h37.8Z" />
        <path id="path75" d="M37.832,113.332H.037L.055,75.556h37.8Z" />
        <path id="path77" d="M37.851,75.555H.056L.073,37.779h37.8Z" />
        <path id="path79" d="M37.869,37.779H.074L.092,0h37.8Z" />
        <path id="use81" d="M189.049,37.779H151.254L151.272,0h37.8Z" />
        <path id="path83" d="M37.813,151.108H.018l.018-37.776h37.8Z" />
        <path id="path85" d="M37.795,188.885H0l.018-37.776h37.8Z" />
        <path id="use87" d="M189.012,113.332H151.217l.018-37.776h37.8Z" />
        <path id="use89" d="M189.031,75.555H151.236l.018-37.776h37.8Z" />
        <path id="use91" d="M188.993,151.108H151.2l.018-37.776h37.8Z" />
        <path id="use93" d="M188.975,188.885h-37.8l.018-37.776h37.8Z" />
        <path id="path97" d="M91.344,113.329H53.55l.018-37.776h37.8Z" fill="#ff7000" />
        <path id="use99" d="M129.122,151.1H91.327l.018-37.776h37.8Z" fill="#ff4900" />
        <path id="use101" d="M129.14,113.329H91.345l.018-37.776h37.8Z" fill="#ff7000" />
        <path id="use103" d="M166.935,113.329H129.14l.018-37.776h37.8Z" fill="#ff7000" />
        <path id="path107" d="M91.363,75.552H53.569l.018-37.776h37.8Z" fill="#ffa300" />
        <path id="use109" d="M166.954,75.552H129.159l.018-37.776h37.8Z" fill="#ffa300" />
        <path id="path113" d="M53.549,113.329H15.755l.018-37.776h37.8Z" fill="#ff7000" />
        <path id="path115" d="M53.568,75.552H15.774l.018-37.776h37.8Z" fill="#ffa300" />
        <path id="path117" d="M53.586,37.776H15.792L15.81,0h37.8Z" fill="#ffce00" />
        <path id="use119" d="M204.767,37.776H166.972L166.99,0h37.8Z" fill="#ffce00" />
        <path id="path123" d="M53.531,151.1H15.737l.018-37.776h37.8Z" fill="#ff4900" />
        <path id="path125" d="M53.512,188.882H15.718l.018-37.776h37.8Z" fill="#ff0107" />
        <path id="use127" d="M204.73,113.329H166.935l.018-37.776h37.8Z" fill="#ff7000" />
        <path id="path129" d="M204.749,75.552H166.954l.018-37.776h37.8Z" fill="#ffa300" />
        <path id="use131" d="M204.712,151.1H166.917l.018-37.776h37.8Z" fill="#ff4900" />
        <path id="use133" d="M204.693,188.882H166.9l.018-37.776h37.8Z" fill="#ff0107" />
      </g>
    </svg>
  );
}

export default function ProviderLogo({ className, apiId, api }: { className: string; apiId: string; api: string }) {
  if (api === "openrouter") {
    const apiIdSwitch = apiId?.split("/")[0].trim().toLowerCase();
    switch (apiIdSwitch) {
      case "openai":
        return <OpenAI className={className} />;
      case "google":
        return (
          <div className={cn("flex items-center justify-center rounded-full bg-white", className)}>
            <GoogleLogo className={"size-[60%]!"} />
          </div>
        );
      case "meta":
      case "meta-llama":
        return (
          <div className={cn("flex items-center justify-center rounded-full bg-white", className)}>
            <MetaLogo className={"size-[60%]!"} />
          </div>
        );
      case "replicate":
        return (
          <div className={cn("flex items-center justify-center rounded-full bg-white", className)}>
            <ReplicateLogo className={"size-[60%]!"} />
          </div>
        );
      case "x-ai":
        return (
          <div className={cn("flex items-center justify-center rounded-full bg-black", className)}>
            <XAILogo className={"size-[50%]!"} />
          </div>
        );
      case "deepseek":
        return (
          <div className={cn("flex items-center justify-center rounded-full bg-white", className)}>
            <DeepseekLogo className={"size-[60%]!"} />
          </div>
        );
      case "anthropic":
        return (
          <div className={cn("flex items-center justify-center rounded-full bg-[#d4a27f]", className)}>
            <AnthropicLogo className={"size-[60%]!"} />
          </div>
        );
      case "mistralai":
        return (
          <div className={cn("flex items-center justify-center rounded-full bg-white", className)}>
            <MistralLogo className={"size-[60%]!"} />
          </div>
        );
      default:
        return (
          <div className={cn("flex items-center justify-center rounded-full bg-white", className)}>
            <Logo className="size-[60%]!" />
          </div>
        );
    }
  } else {
    return (
      <div className={cn("flex items-center justify-center rounded-full bg-white", className)}>
        <Logo className="size-[60%]!" />
      </div>
    );
  }
}
