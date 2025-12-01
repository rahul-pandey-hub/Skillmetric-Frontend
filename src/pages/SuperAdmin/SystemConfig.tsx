import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Settings, QuestionAnswer, EmojiEvents, AttachMoney } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const SystemConfig = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Configuration
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Manage system-wide templates, question pools, certifications, and pricing plans
        </Typography>

        <Paper elevation={3} sx={{ mt: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Settings />} label="Exam Templates" />
            <Tab icon={<QuestionAnswer />} label="Question Pools" />
            <Tab icon={<EmojiEvents />} label="Certifications" />
            <Tab icon={<AttachMoney />} label="Pricing Plans" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Exam Templates</Typography>
                <Button variant="contained">Create Template</Button>
              </Box>
              <Typography color="textSecondary">
                Exam templates allow organizations to quickly create exams based on predefined settings and structures.
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {['Technical Assessment', 'Aptitude Test', 'Language Proficiency'].map((template) => (
                  <Grid item xs={12} md={4} key={template}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{template}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Pre-configured template
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">Edit</Button>
                        <Button size="small" color="error">
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Public Question Pools</Typography>
                <Button variant="contained">Create Pool</Button>
              </Box>
              <Typography color="textSecondary">
                Question pools are collections of questions that can be shared across organizations.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">System Certifications</Typography>
                <Button variant="contained">Create Certification</Button>
              </Box>
              <Typography color="textSecondary">
                Define certification criteria that can be awarded to users based on their performance.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Pricing Plans</Typography>
                <Button variant="contained">Create Plan</Button>
              </Box>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {[
                  { name: 'Free', price: '$0', features: ['1,000 credits', '100 users', '10 exams/month'] },
                  { name: 'Basic', price: '$99', features: ['10,000 credits', '500 users', '50 exams/month'] },
                  { name: 'Pro', price: '$299', features: ['50,000 credits', '2,000 users', 'Unlimited exams'] },
                  { name: 'Enterprise', price: 'Custom', features: ['Custom credits', 'Unlimited users', 'Dedicated support'] },
                ].map((plan) => (
                  <Grid item xs={12} md={3} key={plan.name}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>
                          {plan.name}
                        </Typography>
                        <Typography variant="h4" color="primary" gutterBottom>
                          {plan.price}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="ul">
                          {plan.features.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">Edit</Button>
                        <Button size="small" color="error">
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default SystemConfig;
