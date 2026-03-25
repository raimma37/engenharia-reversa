import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, useTheme, Paper, Typography, Modal } from "@material-ui/core";
import { PlayCircleOutline } from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";

const useStyles = makeStyles(theme => ({
  mainPaperContainer: {
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  },
  mainPaper: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(3),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: '1fr',
    },
  },
  helpPaper: {
    position: 'relative',
    width: '100%',
    minHeight: '320px',
    borderRadius: 16,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: theme.mode === 'dark'
      ? 'linear-gradient(145deg, #1e1e2e 0%, #252535 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
    border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.12)'}`,
    boxShadow: theme.mode === 'dark'
      ? '0 4px 24px rgba(0,0,0,0.4)'
      : '0 4px 20px rgba(99,102,241,0.08)',
    transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease',
    '&:hover': {
      transform: 'translateY(-6px) scale(1.01)',
      boxShadow: theme.mode === 'dark'
        ? '0 16px 40px rgba(0,0,0,0.55)'
        : '0 16px 40px rgba(99,102,241,0.22)',
    },
    '&:hover $thumbnailOverlay': {
      opacity: 1,
    },
    '&:hover $playIcon': {
      transform: 'scale(1.15)',
    },
  },
  thumbnailWrapper: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.4s ease',
    '$helpPaper:hover &': {
      transform: 'scale(1.05)',
    },
  },
  thumbnailOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.75) 0%, rgba(139,92,246,0.75) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.28s ease',
  },
  playIcon: {
    color: '#ffffff',
    fontSize: 56,
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
  },
  cardContent: {
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  videoTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: theme.mode === 'dark' ? '#e2e8f0' : '#1e293b',
    lineHeight: 1.4,
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  },
  videoDescription: {
    fontSize: '0.813rem',
    color: theme.mode === 'dark' ? '#94a3b8' : '#64748b',
    lineHeight: 1.55,
    display: '-webkit-box',
    '-webkit-line-clamp': 3,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  },
  playBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
    paddingTop: theme.spacing(0.75),
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#6366f1',
  },
  videoModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  videoModalContent: {
    outline: 'none',
    width: '90%',
    maxWidth: 1024,
    aspectRatio: '16/9',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
    background: '#000',
  },
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8),
    color: theme.mode === 'dark' ? '#475569' : '#94a3b8',
    gap: theme.spacing(1),
  },
}));

const Helps = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const helps = await list();
      setRecords(helps);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <div className={classes.videoModalContent}>
          {selectedVideo && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, border: 0 }}
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    );
  };

  const renderHelps = () => {
    return (
      <>
        <div className={`${classes.mainPaper} ${classes.mainPaperContainer}`}>
          {records.length ? records.map((record, key) => (
            <Paper
              key={key}
              className={classes.helpPaper}
              elevation={0}
              onClick={() => openVideoModal(record.video)}
            >
              <div className={classes.thumbnailWrapper}>
                <img
                  src={`https://img.youtube.com/vi/${record.video}/mqdefault.jpg`}
                  alt="Thumbnail"
                  className={classes.videoThumbnail}
                />
                <div className={classes.thumbnailOverlay}>
                  <PlayCircleOutline className={classes.playIcon} />
                </div>
              </div>
              <div className={classes.cardContent}>
                <Typography className={classes.videoTitle}>
                  {record.title}
                </Typography>
                <Typography className={classes.videoDescription}>
                  {record.description}
                </Typography>
                <span className={classes.playBadge}>
                  <PlayCircleOutline style={{ fontSize: 14 }} />
                  Assistir vídeo
                </span>
              </div>
            </Paper>
          )) : (
            <div className={classes.emptyState}>
              <PlayCircleOutline style={{ fontSize: 64, opacity: 0.3 }} />
              <Typography variant="h6" style={{ fontWeight: 600, opacity: 0.4 }}>
                Nenhum conteúdo disponível
              </Typography>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("helps.title")} ({records.length})</Title>
        <MainHeaderButtonsWrapper></MainHeaderButtonsWrapper>
      </MainHeader>
      {renderHelps()}
      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;