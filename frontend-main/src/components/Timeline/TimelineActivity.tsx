import { Grid, Typography, Box } from "@mui/material";
import { Activity } from "../../utils/types";
import { cleanTikTokVideoURL } from "../../utils/utils";

interface TimelineActivityProps {
  width: string;
  activity: Activity;
}

export default function TimelineActivity({ activity, width }: TimelineActivityProps) {
  const displayTiktok = (url: string) => {
    const video = cleanTikTokVideoURL(url);
    if (typeof video === "string") {
      return <Typography>Broken URL link</Typography>;
    }
    return (
      <Box sx={{ position: "relative", paddingTop: "177.78%", width: "100%" }}>
        <iframe
          src={`https://www.tiktok.com/player/v1/${video.id}?rel=0&description=1`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "8px",
            border: "none",
          }}
        />
      </Box>
    );
  };

  return (
    <div style={{ width }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={8}>
          <Typography variant="h5" sx={{ mt: "0.4rem" }}>
            {activity.activity}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: "0.4rem" }}>
            {activity.location}
          </Typography>
          {activity.inspiredBy != null && (
            <>
              <Typography variant="body2" sx={{ fontStyle: "italic", mt: "0.4rem" }}>
                Inspired by this TikTok Video
              </Typography>
              <Typography variant="body1" sx={{ mt: "0.2rem" }}>
                {activity.inspiredBy.explanation}
              </Typography>
            </>
          )}
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          {activity.inspiredBy != null && (
            <Box sx={{ maxWidth: "250px" }}>
              {displayTiktok(activity.inspiredBy.video_url)}
            </Box>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
