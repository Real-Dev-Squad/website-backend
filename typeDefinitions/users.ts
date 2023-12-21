export type User = {
  username?: string;
  first_name?: string;
  last_name?: string;
  discordId?: string;
  yoe?: number;
  img?: string;
  linkedin_id?: string;
  github_id?: string;
  github_display_name?: string;
  github_created_at?: number;
  isMember?: boolean;
  phone?: string;
  email?: string;
  discordJoinedAt?: string;
  joined_discord?: string;
  roles?: {
    member?: boolean;
    in_discord?: boolean;
  };
  tokens?: {
    githubAccessToken?: string;
  };
  status?: string;
  profileURL?: string;
  picture?: {
    publicId?: string;
    url?: string;
  };
  incompleteUserDetails?: boolean;
  nickname_synced?: boolean;
};
