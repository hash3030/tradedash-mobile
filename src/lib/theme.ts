import { StyleSheet } from 'react-native'
import { colors } from './utils'

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.bg2,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
  },
  btnPrimaryText: {
    color: colors.accentText,
    fontWeight: '600' as const,
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    color: colors.text,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    marginTop: 4,
  },
})
