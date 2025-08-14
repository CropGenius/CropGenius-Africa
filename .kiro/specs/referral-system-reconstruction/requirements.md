# Requirements Document

## Introduction

The CropGenius referral system is currently in a catastrophic state with users experiencing 404 errors when trying to access referrals. This spec addresses the complete reconstruction of the referral system to create a viral growth engine capable of reaching 100 million farmers. The system must transform users into viral ambassadors who feel superior for sharing CropGenius, not like they're doing us a favor.

## Requirements

### Requirement 1: Emergency Route and Page Creation

**User Story:** As a user, I want to access the referrals page from the More menu, so that I can invite friends and earn rewards without getting a 404 error.

#### Acceptance Criteria

1. WHEN a user clicks "Referrals" in the More menu THEN the system SHALL navigate to `/referrals` without showing a 404 error
2. WHEN a user lands on the referrals page THEN the system SHALL display their unique referral code prominently
3. WHEN a user views the referrals page THEN the system SHALL show their current referral statistics (count and credits earned)
4. WHEN a user is on the referrals page THEN the system SHALL provide sharing options for WhatsApp, social media, and copy-to-clipboard
5. IF the user has no referrals yet THEN the system SHALL display encouraging onboarding content explaining the benefits

### Requirement 2: Referral Link Generation and Sharing

**User Story:** As a user, I want to generate and share referral links, so that I can easily invite friends through multiple channels and track my referrals.

#### Acceptance Criteria

1. WHEN a user accesses their referral page THEN the system SHALL generate a unique referral code based on their user ID
2. WHEN a user wants to share their referral THEN the system SHALL provide a full referral link in format `https://cropgenius.app/join?ref=CODE`
3. WHEN a user clicks WhatsApp share THEN the system SHALL open WhatsApp with a pre-formatted viral message including their referral link
4. WHEN a user clicks social share THEN the system SHALL attempt native Web Share API first, then fallback to WhatsApp
5. WHEN a user clicks copy link THEN the system SHALL copy the referral link to clipboard and show confirmation
6. WHEN a user shares via any method THEN the system SHALL track the sharing event for analytics

### Requirement 3: Referral Link Processing and Attribution

**User Story:** As a new user, I want to sign up through a referral link, so that both my referrer and I receive appropriate rewards and the referral is properly tracked.

#### Acceptance Criteria

1. WHEN a user visits a referral link `/join?ref=CODE` THEN the system SHALL display a welcoming landing page indicating they were invited
2. WHEN a user with a referral code signs up THEN the system SHALL store the referral code for attribution during account creation
3. WHEN a new user completes signup with a referral code THEN the system SHALL automatically process the referral and issue rewards
4. WHEN a referral is processed THEN the system SHALL award 10 credits to the referrer and 10 credits to the new user
5. WHEN a referral is processed THEN the system SHALL prevent duplicate processing for the same referred user
6. IF a referral code is invalid or expired THEN the system SHALL still allow signup but without referral attribution

### Requirement 4: Viral Message Generation and Optimization

**User Story:** As a user, I want to share compelling viral messages about my achievements, so that my friends are motivated to join CropGenius and I feel proud of my farming success.

#### Acceptance Criteria

1. WHEN a user shares their referral THEN the system SHALL generate viral messages that emphasize their farming achievements and expertise
2. WHEN creating viral messages THEN the system SHALL include specific stats like savings amount, streak days, and achievements earned
3. WHEN generating messages THEN the system SHALL use motivational language that makes the user feel superior and accomplished
4. WHEN sharing achievements THEN the system SHALL include relevant hashtags (#OrganicFarming #CropGenius #SustainableAgriculture)
5. WHEN creating messages THEN the system SHALL include clear call-to-action with app download link
6. WHEN a user has multiple achievements THEN the system SHALL allow them to choose which achievement to highlight in their share

### Requirement 5: Premium Integration and Enhanced Rewards

**User Story:** As a premium user, I want to receive enhanced referral rewards and access advanced referral features, so that my premium subscription provides additional value in growing my network.

#### Acceptance Criteria

1. WHEN a premium user successfully refers someone THEN the system SHALL award them an additional 5 credits as a premium bonus
2. WHEN a user reaches referral milestones (5, 10, 25 referrals) THEN the system SHALL award milestone bonuses (50, 100, 250 credits respectively)
3. WHEN a premium user accesses referrals THEN the system SHALL display advanced analytics including conversion rates and geographic distribution
4. WHEN a premium user views referral analytics THEN the system SHALL show click-through rates, time-based trends, and top-performing channels
5. IF a free user tries to access premium referral features THEN the system SHALL display an upgrade prompt with clear benefits
6. WHEN a premium user refers another user THEN the system SHALL offer the new user a premium trial period

### Requirement 6: Gamification and Achievement System

**User Story:** As a user, I want to earn referral badges and compete on leaderboards, so that referring friends becomes an engaging game that motivates continued sharing.

#### Acceptance Criteria

1. WHEN a user makes their first referral THEN the system SHALL award them the "First Friend" badge and 5 bonus credits
2. WHEN a user reaches 5 referrals THEN the system SHALL award the "Connector" badge and 25 bonus credits
3. WHEN a user reaches 10 referrals THEN the system SHALL award the "Influencer" badge and 50 bonus credits
4. WHEN a user reaches 25 referrals THEN the system SHALL award the "Viral Master" badge and 100 bonus credits
5. WHEN a user earns a referral badge THEN the system SHALL display a celebration animation and allow sharing of the achievement
6. WHEN users view referral leaderboards THEN the system SHALL show top referrers by count, conversion rate, and total rewards earned

### Requirement 7: Fraud Prevention and Security

**User Story:** As a system administrator, I want to prevent referral fraud and abuse, so that the referral system maintains integrity and rewards are distributed fairly to legitimate users.

#### Acceptance Criteria

1. WHEN processing a referral THEN the system SHALL check for duplicate referred_id to prevent multiple rewards for the same user
2. WHEN detecting suspicious activity THEN the system SHALL flag referrals from the same IP address within short time periods
3. WHEN monitoring referrals THEN the system SHALL track device fingerprints to identify potential self-referral attempts
4. WHEN suspicious activity is detected THEN the system SHALL mark referrals for manual review before issuing rewards
5. WHEN fraud is confirmed THEN the system SHALL reverse fraudulent rewards and potentially suspend the offending account
6. WHEN legitimate users are affected by fraud detection THEN the system SHALL provide an appeal process

### Requirement 8: Analytics and Performance Tracking

**User Story:** As a product manager, I want comprehensive referral analytics, so that I can optimize the referral system for maximum viral growth and track progress toward 100 million farmers.

#### Acceptance Criteria

1. WHEN viewing referral analytics THEN the system SHALL display total referrals, conversion rates, and viral coefficient metrics
2. WHEN analyzing performance THEN the system SHALL track referral chain length and multi-generational referral patterns
3. WHEN monitoring growth THEN the system SHALL show geographic distribution of referrals and top-performing regions
4. WHEN optimizing messages THEN the system SHALL A/B test different viral message variants and track performance
5. WHEN measuring success THEN the system SHALL calculate time-to-first-referral and referral retention rates
6. WHEN reporting progress THEN the system SHALL project growth trajectories toward the 100 million farmer goal

### Requirement 9: Automated Referral Campaigns

**User Story:** As a user, I want to send automated referral invitations through email and SMS, so that I can efficiently reach my contacts without manual effort.

#### Acceptance Criteria

1. WHEN a user wants to invite contacts THEN the system SHALL provide email and SMS invitation options
2. WHEN sending email invitations THEN the system SHALL use pre-designed templates with personalized referral links
3. WHEN sending SMS invitations THEN the system SHALL include concise viral messages with referral links
4. WHEN campaigns are sent THEN the system SHALL track delivery rates, open rates, and conversion rates
5. WHEN users schedule campaigns THEN the system SHALL allow delayed sending and follow-up sequences
6. IF a user exceeds invitation limits THEN the system SHALL implement rate limiting to prevent spam

### Requirement 10: Social Media Integration and Automation

**User Story:** As a user, I want to automatically post my farming achievements to social media with referral links, so that I can effortlessly grow my network while showcasing my success.

#### Acceptance Criteria

1. WHEN a user achieves farming milestones THEN the system SHALL offer to automatically post achievements to connected social accounts
2. WHEN posting to Twitter THEN the system SHALL format messages within character limits and include relevant hashtags
3. WHEN posting to Facebook THEN the system SHALL use rich media formats with achievement images and referral links
4. WHEN scheduling posts THEN the system SHALL allow users to queue multiple posts for optimal timing
5. WHEN posts are published THEN the system SHALL track engagement metrics and referral conversions from each platform
6. IF social media APIs are unavailable THEN the system SHALL provide manual sharing options with pre-formatted content