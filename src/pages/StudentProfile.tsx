import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Calendar,
  Globe,
  Linkedin,
  Github,
  Trophy,
  TrendingUp,
  Star,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
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
      <div className="container mx-auto max-w-6xl py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error || 'Profile not found'}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate('/student')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => navigate('/student')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-4xl font-bold">My Profile</h1>
      </div>

      {/* Profile Header Card */}
      <Card className="p-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-5xl font-bold overflow-hidden">
            {profile.profileDetails?.profilePicture ? (
              <img
                src={profile.profileDetails.profilePicture}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
            <div className="flex gap-2 flex-wrap mb-2">
              <Badge>{profile.role}</Badge>
              {profile.profileDetails?.college && (
                <Badge variant="outline">{profile.profileDetails.college}</Badge>
              )}
              {profile.profileDetails?.graduationYear && (
                <Badge variant="outline">Class of {profile.profileDetails.graduationYear}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Member since {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>
            {profile.profileDetails?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{profile.profileDetails.phone}</p>
                </div>
              </div>
            )}
            {profile.profileDetails?.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date of Birth</p>
                  <p className="text-sm text-muted-foreground">{formatDate(profile.profileDetails.dateOfBirth)}</p>
                </div>
              </div>
            )}
            {profile.profileDetails?.gender && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Gender</p>
                  <p className="text-sm text-muted-foreground">{profile.profileDetails.gender}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Academic Information */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Academic Information</h3>
          <div className="border-t pt-4 space-y-4">
            {profile.profileDetails?.college && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">College</p>
                  <p className="text-sm text-muted-foreground">{profile.profileDetails.college}</p>
                </div>
              </div>
            )}
            {profile.profileDetails?.university && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">University</p>
                  <p className="text-sm text-muted-foreground">{profile.profileDetails.university}</p>
                </div>
              </div>
            )}
            {profile.profileDetails?.degree && (
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Degree</p>
                  <p className="text-sm text-muted-foreground">{profile.profileDetails.degree}</p>
                </div>
              </div>
            )}
            {profile.profileDetails?.branch && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Branch/Major</p>
                  <p className="text-sm text-muted-foreground">{profile.profileDetails.branch}</p>
                </div>
              </div>
            )}
            {profile.profileDetails?.rollNumber && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Roll Number</p>
                  <p className="text-sm text-muted-foreground">{profile.profileDetails.rollNumber}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Skill Profile */}
      {profile.skillProfile && (
        <Card className="p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Skill Profile</h3>
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="h-12 w-12 text-warning mx-auto mb-2" />
                  <p className="text-muted-foreground mb-1">Overall Rating</p>
                  <h3 className="text-4xl font-bold">
                    {profile.skillProfile.overallRating?.toFixed(1) || 'N/A'}
                  </h3>
                  <p className="text-xs text-muted-foreground">out of 5.0</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground mb-1">Assessments Taken</p>
                  <h3 className="text-4xl font-bold">
                    {profile.skillProfile.assessmentsTaken || 0}
                  </h3>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 text-success mx-auto mb-2" />
                  <p className="text-muted-foreground mb-1">Skills Evaluated</p>
                  <h3 className="text-4xl font-bold">
                    {profile.skillProfile.skills?.length || 0}
                  </h3>
                </CardContent>
              </Card>
            </div>

            {profile.skillProfile.strengths && profile.skillProfile.strengths.length > 0 && (
              <div className="mb-4">
                <p className="font-medium mb-2">Strengths</p>
                <div className="flex gap-2 flex-wrap">
                  {profile.skillProfile.strengths.map((strength, index) => (
                    <Badge key={index} variant="success">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.skillProfile.weaknesses && profile.skillProfile.weaknesses.length > 0 && (
              <div>
                <p className="font-medium mb-2">Areas for Improvement</p>
                <div className="flex gap-2 flex-wrap">
                  {profile.skillProfile.weaknesses.map((weakness, index) => (
                    <Badge key={index} variant="warning">
                      {weakness}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card className="p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Certifications</h3>
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.certifications.map((cert, index) => (
                <Card key={index} className="border">
                  <CardContent className="pt-6">
                    <h4 className="text-lg font-semibold mb-2">{cert.name}</h4>
                    {cert.description && (
                      <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                    )}
                    {cert.issuedAt && (
                      <p className="text-xs text-muted-foreground">
                        Issued: {formatDate(cert.issuedAt)}
                      </p>
                    )}
                    {cert.expiresAt && (
                      <p className="text-xs text-muted-foreground">
                        Expires: {formatDate(cert.expiresAt)}
                      </p>
                    )}
                    {cert.certificateUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        asChild
                      >
                        <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                          View Certificate
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Social Links */}
      {(profile.profileDetails?.linkedIn || profile.profileDetails?.github || profile.profileDetails?.portfolio) && (
        <Card className="p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Social Links</h3>
          <div className="border-t pt-4">
            <div className="flex gap-3 flex-wrap">
              {profile.profileDetails.linkedIn && (
                <Button variant="outline" className="gap-2" asChild>
                  <a href={profile.profileDetails.linkedIn} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
              )}
              {profile.profileDetails.github && (
                <Button variant="outline" className="gap-2" asChild>
                  <a href={profile.profileDetails.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              )}
              {profile.profileDetails.portfolio && (
                <Button variant="outline" className="gap-2" asChild>
                  <a href={profile.profileDetails.portfolio} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    Portfolio
                  </a>
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Skills */}
      {profile.profileDetails?.skills && profile.profileDetails.skills.length > 0 && (
        <Card className="p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Skills</h3>
          <div className="border-t pt-4">
            <div className="flex gap-2 flex-wrap">
              {profile.profileDetails.skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentProfile;
