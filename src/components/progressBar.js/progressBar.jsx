import { Box } from "@mui/material"



export default function ProgressBar({ pos }) {

    const neg = 100 - pos;
    const color = pos === 100 ? "#02a80d" : (neg === 100 ? "#f71919" : "")

    const parent = {
        display: "flex",
        width: "8rem",
        height: "1rem"
    }

    const negStyle = {
        background: "#f71919",
        width: `${neg}%`,
        border: "1px solid #f71919",
        borderRadius: "20px 0px 0px 20px"
    }

    const posStyle = {
        background: "#02a80d",
        width: `${pos}%`,
        border: "1px solid #02a80d",
        borderRadius: "0px 20px 20px 0px"
    }

    const fullBar = {
        background: `${color}`,
        width: `100%`,
        border: `1px solid ${color}`,
        borderRadius: "20px"
    }

    return (
        <div>
            {
                (pos === 100 || pos === 0) ?
                    <Box style={parent}>
                        <Box style={fullBar}></Box></Box> :
                    <Box style={parent}>
                        <Box style={negStyle}></Box>
                        <Box style={posStyle}></Box>
                    </Box>
            }
        </div>
    )
}