// import React from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { TikTokVideoObject, TripInfo } from "../../utils/types";
import { useEffect, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";

const MOCK_ITINERARY = JSON.stringify({
  activities: [
    { startTime: "8:00", endTime: "9:30", activity: "Breakfast at a local café", location: "City Center", inspiredBy: null },
    { startTime: "10:00", endTime: "12:00", activity: "Visit the main historical museum", location: "Old Town", inspiredBy: null },
    { startTime: "12:30", endTime: "13:30", activity: "Lunch at a street food market", location: "Market Square", inspiredBy: null },
    { startTime: "14:00", endTime: "16:00", activity: "Explore the botanical gardens", location: "East Park", inspiredBy: null },
    { startTime: "16:30", endTime: "18:00", activity: "Shopping at local boutiques", location: "Shopping District", inspiredBy: null },
    { startTime: "19:00", endTime: "21:00", activity: "Dinner at a rooftop restaurant", location: "Skyline Avenue", inspiredBy: null },
  ],
});

interface FormSubmitGenerateProps {
  tripInfo: TripInfo;
  videos?: Map<string, TikTokVideoObject>;
}

export default function FormSubmitGenerate({
  tripInfo,
}: FormSubmitGenerateProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusList, setStatusList] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setStatusList([
      "processing your request",
      `wow, you're going to ${tripInfo.location}`,
      "analyzing your tiktoks",
      "googlin- i mean doing some magic",
      "great choice of videos, btw",
      "crafting the best place for ya",
      "bored, yet? dw, almost there",
    ]);
  }, [tripInfo.location]);

  const handleSubmit = async () => {
    setLoading(true);
    let progressValue = 0;

    const interval = setInterval(() => {
      progressValue += 2;
      setProgress(progressValue);
      if (progressValue >= 100) {
        clearInterval(interval);
        localStorage.setItem("demo_itinerary", MOCK_ITINERARY);
        localStorage.setItem("demo_location", `Location: ${tripInfo.location || "Your Destination"} \n`);
        setLoading(false);
        setProgress(0);
        navigate(`/your-trip/demo`);
      }
    }, 60);
  };
  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 400,
        textAlign: "center",
      }}
    >
      {!loading && (
        <>
          <IconButton
            sx={{ fontSize: "3rem" }}
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            <SendIcon sx={{ width: 200, height: 200 }} />
          </IconButton>
          <Typography variant="h6" sx={{ marginTop: "10px" }}>
            Ready? Swipe And Fly!
          </Typography>
        </>
      )}
      {loading && (
        <>
          <CircularProgress color="secondary" sx={{ marginBottom: 6 }} />
          <Box
            sx={{
              width: "80%",
              height: 30,
              backgroundColor: "f3f3f3",
              borderRadius: "5px",
              overflow: "hidden",
              border: "solid 2px",
            }}
          >
            {statusList[Math.floor(progress / (100 / statusList.length))]}
            <Box
              sx={{
                height: "100%",
                marginTop: -3,
                backgroundColor: "#FE2858",
                width: `${progress}%`,
                transition: "width 0.3s ease-in-out",
              }}
            ></Box>
          </Box>
        </>
      )}
    </Paper>
  );
}
