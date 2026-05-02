import {
  Paper,
  Grid,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  SxProps,
} from "@mui/material";
import { TikTokVideoObject } from "../../../utils/types";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import DeleteIcon from "@mui/icons-material/Delete";

interface VideoDisplayProps {
  videos: Map<string, TikTokVideoObject>;
  listVid: TikTokVideoObject[];
  handleDeleteVid?: (index: number, video: TikTokVideoObject) => void;
  handleChangeVid?: (video: TikTokVideoObject) => void;
  orientation: "vertical" | "horizontal";
  videosPerRow?: number;
  minimalSettings?: boolean;
  sx: SxProps | undefined;
}

const VideoEmbed = ({ id }: { id: string }) => (
  <Box sx={{ position: "relative", paddingTop: "177.78%", width: "100%" }}>
    <iframe
      src={`https://www.tiktok.com/player/v1/${id}?rel=0&description=1`}
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

const EmptyState = ({ message }: { message: string }) => (
  <Paper
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      maxWidth: 400,
      margin: "auto",
      padding: 4,
      borderRadius: 2,
      boxShadow: 1,
    }}
  >
    <SlowMotionVideoIcon fontSize="inherit" color="secondary" sx={{ fontSize: 40 }} />
    <Typography variant="body1" sx={{ marginTop: 2 }} textAlign="center">
      {message}
    </Typography>
  </Paper>
);

export default function VideoDisplay({
  videos,
  listVid,
  handleDeleteVid,
  handleChangeVid,
  orientation,
  videosPerRow = 4,
  minimalSettings = false,
  sx,
}: VideoDisplayProps) {
  const settingBox = (video: TikTokVideoObject, index: number) => {
    if (minimalSettings) {
      return handleChangeVid ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Checkbox
            checked={videos.has(video.id)}
            onChange={() => handleChangeVid(video)}
            color="primary"
          />
        </Box>
      ) : <></>;
    }
    return (
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={videos.has(video.id)}
              onChange={() => handleChangeVid && handleChangeVid(video)}
            />
          }
          label={
            videos.has(video.id)
              ? <Typography color="primary">Added!</Typography>
              : <Typography>Add to the trip</Typography>
          }
        />
        <IconButton
          color="primary"
          onClick={() => handleDeleteVid && handleDeleteVid(index, video)}
          disableRipple
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    );
  };

  return (
    <Paper elevation={3} sx={sx}>
      {orientation === "vertical" ? (
        <Grid
          container
          spacing={2}
          sx={{ flexGrow: 1, height: "100%", overflowY: "auto", padding: 2 }}
        >
          {listVid.length > 0 ? (
            listVid.map((video, index) => (
              <Grid
                item
                xs={Math.floor(12 / videosPerRow)}
                key={`added-video-${index}`}
              >
                <VideoEmbed id={video.id} />
                {settingBox(video, index)}
              </Grid>
            ))
          ) : (
            <EmptyState message="Add your first TikTok here!" />
          )}
        </Grid>
      ) : listVid.length > 0 ? (
        <Box style={{ display: "flex", overflowX: "auto", gap: 15 }}>
          {listVid.map((video, index) => (
            <Box key={video.id} sx={{ minWidth: 100 / videosPerRow + "%" }}>
              <VideoEmbed id={video.id} />
              {settingBox(video, index)}
            </Box>
          ))}
        </Box>
      ) : (
        <EmptyState message="Nothing added yet!" />
      )}
    </Paper>
  );
}
