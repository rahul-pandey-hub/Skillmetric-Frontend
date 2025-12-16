import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  School,
  Work,
  CalendarToday,
  Language,
  LinkedIn,
  GitHub,
  EmojiEvents,
  TrendingUp,
  Star,
  ArrowBack,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileDetails?: {
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    profilePicture?: string;
    college?: string;
    university?: string;
    degree?: string;
    branch?: string;
    graduationYear?: number;
    rollNumber?: string;
    company?: string;
    designation?: string;
    experience?: number;
    skills?: string[];
    resume?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  skillProfile?: {
    overallRating?: number;
    assessmentsTaken?: number;
    skills?: Array<{
      category: string;
      level: string;
      score: number;
      percentile: number;
    }>;
    strengths?: string[];
    weaknesses?: string[];
  };
  certifications?: Array<{
    name: string;
    description?: string;
    badge?: string;
    certificateUrl?: string;
    issuedAt?: string;
    expiresAt?: string;
    associatedExam?: string;
  }>;
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    profileVisibility?: string;
    language?: string;
    timezone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const StudentProfile = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/student/exams/profile');
      setProfile(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load profile';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Profile not found'}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/student')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/student')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
      </Box>

      {/* Profile Header Card */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            src={profile.profileDetails?.profilePicture}
            sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: 48 }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" gutterBottom>
              {profile.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip label={profile.role} color="primary" size="small" />
              {profile.profileDetails?.college && (
                <Chip label={profile.profileDetails.college} size="small" />
              )}
              {profile.profileDetails?.graduationYear && (
                <Chip label={`Class of ${profile.profileDetails.graduationYear}`} size="small" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Member since {formatDate(profile.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={profile.email}
                />
              </ListItem>
              {profile.profileDetails?.phone && (
                <ListItem>
                  <ListItemIcon>
                    <Phone color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={profile.profileDetails.phone}
                  />
                </ListItem>
              )}
              {profile.profileDetails?.dateOfBirth && (
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date of Birth"
                    secondary={formatDate(profile.profileDetails.dateOfBirth)}
                  />
                </ListItem>
              )}
              {profile.profileDetails?.gender && (
                <ListItem>
                  <ListItemIcon>
                    <Person color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gender"
                    secondary={profile.profileDetails.gender}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Academic Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Academic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {profile.profileDetails?.college && (
                <ListItem>
                  <ListItemIcon>
                    <School color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="College"
                    secondary={profile.profileDetails.college}
                  />
                </ListItem>
              )}
              {profile.profileDetails?.university && (
                <ListItem>
                  <ListItemIcon>
                    <School color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="University"
                    secondary={profile.profileDetails.university}
                  />
                </ListItem>
              )}
              {profile.profileDetails?.degree && (
                <ListItem>
                  <ListItemIcon>
                    <EmojiEvents color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Degree"
                    secondary={profile.profileDetails.degree}
                  />
                </ListItem>
              )}
              {profile.profileDetails?.branch && (
                <ListItem>
                  <ListItemIcon>
                    <Work color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Branch/Major"
                    secondary={profile.profileDetails.branch}
                  />
                </ListItem>
              )}
              {profile.profileDetails?.rollNumber && (
                <ListItem>
                  <ListItemIcon>
                    <Person color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Roll Number"
                    secondary={profile.profileDetails.rollNumber}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Skill Profile */}
        {profile.skillProfile && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Skill Profile
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Star sx={{ fontSize: 48, color: '#ffd700', mb: 1 }} />
                      <Typography color="text.secondary" gutterBottom>
                        Overall Rating
                      </Typography>
                      <Typography variant="h3">
                        {profile.skillProfile.overallRating?.toFixed(1) || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        out of 5.0
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: 48, color: '#2196f3', mb: 1 }} />
                      <Typography color="text.secondary" gutterBottom>
                        Assessments Taken
                      </Typography>
                      <Typography variant="h3">
                        {profile.skillProfile.assessmentsTaken || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <EmojiEvents sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                      <Typography color="text.secondary" gutterBottom>
                        Skills Evaluated
                      </Typography>
                      <Typography variant="h3">
                        {profile.skillProfile.skills?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {profile.skillProfile.strengths && profile.skillProfile.strengths.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Strengths
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {profile.skillProfile.strengths.map((strength, index) => (
                      <Chip
                        key={index}
                        label={strength}
                        color="success"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {profile.skillProfile.weaknesses && profile.skillProfile.weaknesses.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Areas for Improvement
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {profile.skillProfile.weaknesses.map((weakness, index) => (
                      <Chip
                        key={index}
                        label={weakness}
                        color="warning"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Certifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {profile.certifications.map((cert, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {cert.name}
                        </Typography>
                        {cert.description && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {cert.description}
                          </Typography>
                        )}
                        {cert.issuedAt && (
                          <Typography variant="caption" display="block">
                            Issued: {formatDate(cert.issuedAt)}
                          </Typography>
                        )}
                        {cert.expiresAt && (
                          <Typography variant="caption" display="block">
                            Expires: {formatDate(cert.expiresAt)}
                          </Typography>
                        )}
                        {cert.certificateUrl && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={cert.certificateUrl}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            View Certificate
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Social Links */}
        {(profile.profileDetails?.linkedIn || profile.profileDetails?.github || profile.profileDetails?.portfolio) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Social Links
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {profile.profileDetails.linkedIn && (
                  <Button
                    variant="outlined"
                    startIcon={<LinkedIn />}
                    href={profile.profileDetails.linkedIn}
                    target="_blank"
                  >
                    LinkedIn
                  </Button>
                )}
                {profile.profileDetails.github && (
                  <Button
                    variant="outlined"
                    startIcon={<GitHub />}
                    href={profile.profileDetails.github}
                    target="_blank"
                  >
                    GitHub
                  </Button>
                )}
                {profile.profileDetails.portfolio && (
                  <Button
                    variant="outlined"
                    startIcon={<Language />}
                    href={profile.profileDetails.portfolio}
                    target="_blank"
                  >
                    Portfolio
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Skills */}
        {profile.profileDetails?.skills && profile.profileDetails.skills.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Skills
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {profile.profileDetails.skills.map((skill, index) => (
                  <Chip key={index} label={skill} color="primary" variant="outlined" />
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default StudentProfile;
